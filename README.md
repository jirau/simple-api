# simple-api

- clone the git repo jirau/simple-api
- create a Cloudant database using the free tier
- log into IBM Cloud with your credentials
- navigate to your target IKS cluster overview page
- click on devops, from the left side menu
- click on kubeCreate a toolchain+ button
- click on develop a Kubernete app
- add Toolchain Name
- specify region and resource group
- select provider GitHub
- authorize the toolchain automation to access GitHub
- Repository type: Existing
- Repository URL: paste your cloned / forked repository
- leave other values unchanged
- click on Deplivery pipeline tab
- app name: simple-apisimp
- provide IBM Cloud API key or create a new one
- select a valid container registry-region (doesn't have to match the cluster location)
- select a valid registry namespace where you would like to have cicd upload images to
- ensure cluster region, resource group, and cluster name all match your target cluster
- Important: cluster namespace must match the k8s namespace you use for secrets

secrets handling
generate secrets string echo -n 'admin' | base64

what could go wrong?
- containers can't access your secrets (secrets created on the wrong namespace)
