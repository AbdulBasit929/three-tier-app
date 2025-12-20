pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE_BACKEND = 'abdulbasit99/backend'
        DOCKER_IMAGE_FRONTEND = 'abdulbasit99/frontend'
        GIT_REPO = 'https://github.com/AbdulBasit929/three-tier-app.git'
        KUBE_NAMESPACE = 'default'
        BUILD_VERSION = "${env.BUILD_NUMBER}"
        TIMESTAMP = sh(script: "date +%Y%m%d-%H%M%S", returnStdout: true).trim()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '  STAGE 1: Checkout Code from GitHub'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                git branch: 'main', url: "${GIT_REPO}"
                echo "✓ Code checked out successfully"
            }
        }
        
        stage('Build Backend Image') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '  STAGE 2: Building Backend Docker Image'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                script {
                    dir('backend') {
                        sh """
                            echo "Building ${DOCKER_IMAGE_BACKEND}:${BUILD_VERSION}"
                            docker build -t ${DOCKER_IMAGE_BACKEND}:${BUILD_VERSION} .
                            docker tag ${DOCKER_IMAGE_BACKEND}:${BUILD_VERSION} ${DOCKER_IMAGE_BACKEND}:latest
                            echo "✓ Backend image built successfully"
                        """
                    }
                }
            }
        }
        
        stage('Build Frontend Image') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '  STAGE 3: Building Frontend Docker Image'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                script {
                    dir('frontend') {
                        sh """
                            echo "Building ${DOCKER_IMAGE_FRONTEND}:${BUILD_VERSION}"
                            docker build -t ${DOCKER_IMAGE_FRONTEND}:${BUILD_VERSION} .
                            docker tag ${DOCKER_IMAGE_FRONTEND}:${BUILD_VERSION} ${DOCKER_IMAGE_FRONTEND}:latest
                            echo "✓ Frontend image built successfully"
                        """
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '  STAGE 4: Pushing Images to Docker Hub'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'docker-hub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh """
                            echo "Logging into Docker Hub..."
                            echo \${DOCKER_PASS} | docker login -u \${DOCKER_USER} --password-stdin
                            
                            echo "Pushing backend images..."
                            docker push ${DOCKER_IMAGE_BACKEND}:${BUILD_VERSION}
                            docker push ${DOCKER_IMAGE_BACKEND}:latest
                            
                            echo "Pushing frontend images..."
                            docker push ${DOCKER_IMAGE_FRONTEND}:${BUILD_VERSION}
                            docker push ${DOCKER_IMAGE_FRONTEND}:latest
                            
                            echo "✓ All images pushed successfully"
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '  STAGE 5: Deploying to GKE'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                script {
                    sh """
                        echo "Updating backend deployment..."
                        kubectl set image deployment/backend-deployment \
                            backend=${DOCKER_IMAGE_BACKEND}:${BUILD_VERSION} \
                            -n ${KUBE_NAMESPACE}
                        
                        echo "Updating frontend deployment..."
                        kubectl set image deployment/frontend-deployment \
                            frontend=${DOCKER_IMAGE_FRONTEND}:${BUILD_VERSION} \
                            -n ${KUBE_NAMESPACE}
                        
                        echo "Waiting for backend rollout..."
                        kubectl rollout status deployment/backend-deployment -n ${KUBE_NAMESPACE}
                        
                        echo "Waiting for frontend rollout..."
                        kubectl rollout status deployment/frontend-deployment -n ${KUBE_NAMESPACE}
                        
                        echo "✓ Deployment completed successfully"
                    """
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '  STAGE 6: Verifying Deployment'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                script {
                    sh """
                        echo "Current Pods:"
                        kubectl get pods -n ${KUBE_NAMESPACE} -l app=backend
                        kubectl get pods -n ${KUBE_NAMESPACE} -l app=frontend
                        
                        echo ""
                        echo "Services:"
                        kubectl get svc -n ${KUBE_NAMESPACE}
                        
                        echo ""
                        echo "Testing backend health..."
                        kubectl exec -n ${KUBE_NAMESPACE} deployment/backend-deployment -- curl -s http://localhost:5000/health || echo "Health check failed"
                        
                        echo "✓ Verification completed"
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            echo '  ✓ PIPELINE COMPLETED SUCCESSFULLY!'
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            script {
                def appUrl = sh(
                    script: "kubectl get svc frontend-service -n ${KUBE_NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}'",
                    returnStdout: true
                ).trim()
                echo "Application URL: http://${appUrl}"
                echo "Build: ${BUILD_VERSION}"
                echo "Timestamp: ${TIMESTAMP}"
            }
        }
        failure {
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            echo '  ✗ PIPELINE FAILED'
            echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
        }
        always {
            echo 'Cleaning up...'
            sh 'docker logout || true'
        }
    }
}
