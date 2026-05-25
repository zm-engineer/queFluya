// Declarative pipeline for queFluya.
//
// Stages 1-3 run inside a fresh `node:20-bookworm` container per build so
// the host doesn't need Node installed. Stage 4 runs on the Jenkins
// controller, which needs the host Docker socket mounted (see jenkins/SETUP.md).
//
// Credentials expected in Jenkins (Manage Jenkins -> Credentials -> System
// -> Global credentials):
//   - supabase-url       (Secret text)  NEXT_PUBLIC_SUPABASE_URL
//   - supabase-anon-key  (Secret text)  NEXT_PUBLIC_SUPABASE_ANON_KEY

pipeline {
    agent none

    options {
        timestamps()
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    environment {
        IMAGE_NAME = 'quefluya'
    }

    stages {

        stage('Node: install, lint, test') {
            agent {
                docker {
                    image 'node:20-bookworm'
                    reuseNode true
                }
            }
            stages {
                stage('Install') {
                    steps {
                        sh 'node --version && npm --version'
                        sh 'npm ci'
                    }
                }
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('Unit tests') {
                    steps {
                        sh 'npx prisma generate'
                        sh 'npm run test:run'
                    }
                }
            }
        }

        stage('Docker: build image') {
            agent any
            steps {
                withCredentials([
                    string(credentialsId: 'supabase-url', variable: 'SUPABASE_URL'),
                    string(credentialsId: 'supabase-anon-key', variable: 'SUPABASE_KEY')
                ]) {
                    script {
                        def shortSha = env.GIT_COMMIT?.take(7) ?: env.BUILD_NUMBER
                        sh """
                            docker build \\
                                --build-arg NEXT_PUBLIC_SUPABASE_URL="\$SUPABASE_URL" \\
                                --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="\$SUPABASE_KEY" \\
                                -t ${IMAGE_NAME}:${shortSha} \\
                                -t ${IMAGE_NAME}:latest \\
                                .
                        """
                        sh "docker images ${IMAGE_NAME} | head -5"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Build #${env.BUILD_NUMBER} succeeded."
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} failed. Check stage logs above."
        }
        always {
            node('built-in') {
                cleanWs(notFailBuild: true)
            }
        }
    }
}
