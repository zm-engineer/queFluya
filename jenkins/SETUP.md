# Jenkins setup for queFluya

This guide walks through running Jenkins locally on Docker and wiring it to the `Jenkinsfile` at the root of this repo.

The pipeline has four stages: **Install → Lint → Unit tests → Docker build**. The first three run inside a `node:20-bookworm` container; the fourth runs on the Jenkins controller and needs the host Docker socket.

---

## 1. Start Jenkins in Docker

```bash
docker run -d \
  --name jenkins-quefluya \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -u root \
  jenkins/jenkins:lts-jdk17
```

Why each flag:

- `-p 8080:8080` — Jenkins UI on `http://localhost:8080`.
- `-p 50000:50000` — agent-to-controller port (unused here but standard).
- `-v jenkins_home:/var/jenkins_home` — named volume so jobs and config survive container restarts.
- `-v /var/run/docker.sock:/var/run/docker.sock` — gives Jenkins access to your Mac's Docker daemon (needed for the Docker build stage and the `docker { image '…' }` agents).
- `-u root` — required to read the mounted Docker socket. Not for production, fine for a local learning setup.

---

## 2. Unlock Jenkins

Grab the auto-generated admin password from inside the container:

```bash
docker exec jenkins-quefluya cat /var/jenkins_home/secrets/initialAdminPassword
```

Open `http://localhost:8080`, paste the password, click **Install suggested plugins** (this includes Git, Pipeline, Docker Pipeline). Create your admin user when prompted.

---

## 3. Add the four secrets

Go to **Manage Jenkins → Credentials → System → Global credentials → Add Credentials** and create one for each row below, all as **Secret text**:

| ID                  | Value (from your `.env.local`)            |
| ------------------- | ----------------------------------------- |
| `supabase-url`      | `NEXT_PUBLIC_SUPABASE_URL`                |
| `supabase-anon-key` | `NEXT_PUBLIC_SUPABASE_ANON_KEY`           |

(Only those two are needed for build-time. `DATABASE_URL` and `DIRECT_URL` are runtime-only; not used during the build because Prisma generate doesn't query the DB.)

The IDs must match exactly — the `Jenkinsfile` references them by ID.

---

## 4. Create the pipeline job

1. Dashboard → **New Item**.
2. Name: `quefluya`. Type: **Pipeline**. **OK**.
3. **Build Triggers** → check **Poll SCM**, schedule: `H/5 * * * *` (every ~5 min).
4. **Pipeline → Definition** → *Pipeline script from SCM*.
5. **SCM** → *Git*. Repository URL options:
   - **From a remote** (recommended): `https://github.com/<you>/quefluya.git`
   - **From the local filesystem** (since Jenkins is in a container, the host path is not visible by default): you'd need to also bind-mount the repo into the Jenkins container at startup, e.g. add `-v /Users/ziuling/Documents/react/quefluya:/repo` to step 1 and then use `file:///repo` here. Easier to just push to GitHub.
6. **Branch Specifier**: `*/develop` (or `*/main`).
7. **Script Path**: `Jenkinsfile`.
8. **Save**.

Click **Build Now** to trigger the first run.

---

## 5. What each stage does

| Stage                      | Where it runs                  | What it does                                                                 |
| -------------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| Node: install, lint, test  | `node:20-bookworm` container   | `npm ci`, `npm run lint`, `npx prisma generate`, `npm run test:run`          |
| Docker: build image        | Jenkins controller (host docker) | `docker build` with the two `NEXT_PUBLIC_*` build args, tags `:<sha>` and `:latest` |

The Docker build talks to the host Docker daemon through the mounted socket, so the resulting image (`quefluya:<sha>`) appears in your local `docker images` list — the same one you used in Phase 4.

---

## 6. Common issues

**"docker: command not found" in the build stage.** The Jenkins controller image (`jenkins/jenkins:lts-jdk17`) doesn't have `docker` CLI by default. Two fixes:

```bash
# Option A: install the CLI inside the running container (quick, ephemeral)
docker exec -u root jenkins-quefluya \
  bash -c 'apt-get update -qq && apt-get install -qq -y docker.io'

# Option B: use a Jenkins image that bundles docker, e.g. jenkins/jenkins:lts with a custom Dockerfile.
```

**"Permission denied while connecting to /var/run/docker.sock".** You forgot `-u root` in step 1, or the host socket has restrictive permissions. Easiest fix: restart Jenkins with `-u root`.

**Polling never fires a build.** Jenkins's poll runs only if a commit lands in the watched branch. Push something and wait the 5-minute window, or click **Build Now** to skip the poll.

**Pipeline runs but `withCredentials` fails.** Check the credential ID matches exactly: `supabase-url`, `supabase-anon-key`. Capitalisation matters.

---

## 7. Tearing down

```bash
# Stop Jenkins (keeps the jenkins_home volume so jobs survive)
docker stop jenkins-quefluya

# Remove the container but keep the volume
docker rm jenkins-quefluya

# Nuke everything including job history and config
docker volume rm jenkins_home
```
