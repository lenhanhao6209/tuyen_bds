pipeline {
    agent any
    stages {
        stage('Clone') {
            steps {
                git "https://github.com/lenhanhao6209/check_jenkins_pipe.git"
            }
        }
        stage('Build') {
            steps {
                withDockerRegistry(credentialsId: 'docker', url: 'https://index.docker.io/v1/') {
                    sh 'docker buils -t lenhanhao6209/check_jenkins_pipe:v1 .'
                    sh 'docker push lenhanhao6209/check_jenkins_pipe:v1'
                }
            }
        }
    }
}