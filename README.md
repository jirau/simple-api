<h3>Tutorial: Deploying a cloud-native microservice in the IBM Kubernetes Service, going beyond deployment a Hello World container.</h3>

<p>By following this tutorial, you will be able to exercise all the steps necessary to deploy a cloud-native microservice in the IBM Kubernetes Service by leveraging the IBM Cloud toolchain automation.</p>



<b>Prerequisites</b>
<li>You will need an IBM Cloud Account. If you don't have one, you can sign up for a free trial.</li>
<li>Verify that toolchains and tool integrations are available in your region and IBM Cloud environment.</li>
<li>You will need a IBM Kubernetes Service cluster.</li>
<li>You will need to provision an instance of the IBM Cloudant Database service.</li>

<p>For this tutorial, we will be deploying a simple cloud-native application, using the IBM Cloud toolchain to contenirize, store on a private container registry and then deploy to our target Kubernetes cluster.</p>

<p>The simple-api is a simple microservice that that exposes data via a http RESTful API. The API is based on the loopback4 framework. You can find more information about the loopback framework here. A Cloudant Database will be used by the microservice as the data store.</p>
<p>To start, we will be provisioning our Database service.</p>
<p><b>Provisioning and Configuring the IBM Cloudant Service</b></p>
<li>Log into your IBM Cloud Account</li>
<li>From the dashboard, click Create Resource</li>
<li>Use the <b>Search the catalog..</b> bar and search for "Cloudant"</li>
<li>Click on the Cloudant Service box</li>
<li>Change Authentication method from IAM, to <b>IAM and legacy credentials</b></li>
<li>Ensure Lite plan is selected (note: this is a free tier plan)</li>
<li>Leave all the other service options unchanged</li>
<li>Click <b>Create</b> on the lower right side of the screen</li>

<p>Creating the necessary Cloudant service credentials,</p>
<li>On the Cloudant service page, click on Service Credentials</li>
<li>Then click, <b>New Credentials+</b></li>
<li>On the Create credentials, select Writer as the Role: (Note: these credentials will be used later on)</li>

<p>Creating the Cloudant Database needed for our simple-api container</p>
<li>on the Cloudant service page, click on Manage, and then click on the Launch Dashboard button and log into the dashboard with your IBMid credentials.</li>
<li>On the Database section of the Cloudant Dashboard, click on Create Database on the upper toolbar.</li>
<li>On the Create Database window, enter 'items' (all lower caps) as the Database name, click on the Non-partitioned radio button, then click Create</li>
<li>you can now close the dashboard, as no other steps are needed related to the Cloudant service.</li>

<p><b>Configuring the application code</b></p>
<li>Navigate to https://github.com/jirau/simple-api.git and clone the repository into your own repository</li>
<li>You will need to authorize the IBM Cloud toolchain tool to access your repo in a later step</li>

<p>Notes on Dockerfile, and deployment.yaml</p>
<p>There are two files that are required to deploy a microservice in IKS, using the toolchain. A Dockerfile and a deployment.yaml</p>
A Dockerfile is . . .
The deployment.yaml provides the
- note on environment variables
<p><b>Never commit dependant service credentials and secrets into your code repository. It is suggested that you create a secrets yaml in your local workstation and store in storage media that supports encryption</p></b>

<b>Generating Secrets</b>
<p>Secrets in kubernetes must be encoded to base64. To generate in Mac OS, open the terminal and execute the following command
   $ echo -n '<secret-string>' | base64

</p>

```
apiVersion: v1
kind: Secret
metadata:
  name: mysecret
type: Opaque
data:
  cloudant_url: <add corresponding base64 encoded string here>
  cloudant_user: <add corresponding base64 encoded string here>
  cloudant_password: <add corresponding base64 encoded string here>
```
next, apply the object to the cluster, using kubectl apply command or the ibmcloud cli.


Next we will configure the toolchain service to handle the deployment of our microservice.

Configuring the toolchain
- log into IBM Cloud with your credentials
- navigate to your target IKS cluster overview page
- click on devops, from the left side menu
- click on Create a toolchain+ button
- click on develop a Kubernete app
- add Toolchain Name
- specify region and resource group
- select provider GitHub
- authorize the toolchain automation to access your GitHub repository
- Repository type: Existing
- Repository URL: paste your cloned / forked repository
- leave other values unchanged
- click on Delivery pipeline tab
- app name: simple-api
- provide an existing IBM Cloud API key or create a new key (link on instructions)
- select a valid container registry-region (location doesn't have to match the cluster location)
- select a valid registry namespace where you would like to have the toolchain upload images to
- ensure cluster region, resource group, and cluster name all match your target cluster
- Important: cluster namespace must match the kubernetes namespace you use for secrets



what could go wrong?
- containers can't access your secrets (secrets created on the wrong namespace)
