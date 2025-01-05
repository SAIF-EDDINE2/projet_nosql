pipeline {
    agent {
        label 'docker-agent'
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-saifeddine7')
        DOCKERHUB_USERNAME = 'SAIFEDDINE7'
        PROJECT_NAME = 'projet_nosql'
        IMAGE_TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    sh 'npm test'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                    docker build -t ${SAIFEDDINE7}/${projet_nosql}:${latest} .
                    """
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    sh """
                    echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${SAIFEDDINE7} --password-stdin
                    docker push ${SAIFEDDINE766}/${projet_nosql}:${latest}
                    docker logout
                    """
                }
            }
        }
    }
}