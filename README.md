<h2>Draft: Not Ready</h2>

<h3>Tutorial: Deploying a cloud-native microservice in the IBM Kubernetes Service, going beyond deploying a Hello World application container.</h3>

<p>By following this tutorial, you will be able to exercise all the steps necessary to deploy a cloud-native microservice in the IBM Kubernetes Service (IKS) by leveraging IBM Cloud's toolchain automation.</p>
<br>
<b>Prerequisites</b>
<li>You will need an IBM Cloud Account. If you don't have one, you can sign up for a free trial.</li>
<li>Verify that toolchains and tool integrations are available in your region and IBM Cloud environment.</li>
<li>You will need a IBM Kubernetes Service cluster.</li>
<li>You will need to provision an instance of the IBM Cloudant Database service.</li>

<p>For this tutorial, we will be deploying a simple cloud-native application, using the IBM Cloud toolchain to containerize, store the image on a private container registry and then deploy it to our target Kubernetes cluster. </p>

<p>We will use the code stored in this repository as our sample application microservice, which we will refer to as the <b>simple-api</b>.</p>
<p>The simple-api is a basic nodejs microservice that exposes data via a http RESTful API. The API is based on the loopback4 framework. You can find more information about the loopback framework here (https://loopback.io/). In conjunction with the api, an IBM Cloud Cloudant Database will be used as the data store.</p>
<p>To start, we need to provision our Database service.</p>
<p><b>Provisioning and Configuring the IBM Cloudant Service</b></p>
<li>Log into your IBM Cloud Account</li>
<li>From the dashboard, click Create Resource</li>
<li>Use the <b>Search the catalog..</b> bar and search for "Cloudant"</li>
<li>Click on the Cloudant Service box option</li>
<li>Change the Authentication method from IAM, to <b>IAM and legacy credentials</b></li>
<li>Ensure Lite plan is selected (note: this is a free tier plan)</li>
<li>Leave all the other service options unchanged</li>
<li>Click <b>Create</b> on the lower right side of the screen</li>

<p>Creating the necessary Cloudant service credentials, for our simple-api to expose data</p>
<li>On the Cloudant service page, click on Service Credentials</li>
<li>Then click, <b>New Credentials+</b></li>
<li>On the Create credentials, select Writer as the Role: (Note: these credentials will be used later on when we configure secrets and environment variables)</li>

<p>Creating the Cloudant Database needed for our simple-api container</p>
<li>On the Cloudant service page, click on Manage, and then click on the Launch Dashboard button and log with your IBMid credentials.</li>
<li>On the Database section of the Cloudant Dashboard, click on <b>Create Database</b> on the upper toolbar.</li>
<li>On the Create Database window, enter <b>'items'</b> (ensure all lower caps) as the Database name, click on the Non-partitioned radio button, then click the Create button</li>
<li>You can now close the dashboard, as no other steps are needed related to the Cloudant service.</li>

<p><b>Overview of the application code</b><br>
We will use the toolchain clone option, to clone the code https://github.com/jirau/simple-api.git  into your own repository. As an alterntive, you could clone the code outside of the toolchain process and select the Existing repository option. (you will need to authorize the toolchain to access your repository)<br>
To simplify and to ensure tutorial success, we recommend you first follow the intructions as is and use the clone option within the toolchain.
</p>

<p>Note on IBM Cloud toolchain dependencies for deploying containers on your IKS cluster: <br>
There are two files that are required by the toolchain automation to deploy our microservice on the IBM Kuberenetes Service cluster. These two files are, a 1)<b>Dockerfile</b> and a 2) <b>deployment.yaml</b></p>
<p>Docker builds images automatically by reading the instructions from the Dockerfile. The <b>Dockerfile</b> contains all the instructions and specifications, needed to build a given image.</p>
<p>The <b>deployment.yaml</b> includes the Kubernetes deployment and service API objects with the specifications for our cluster master node to provision and manage our microservice resources. Additional objects could be added under this file, by using the <b>---</b> triple dash separator. </p>

<p>Note on environment variables:<br>
<b>Never commit service credentials and secrets dependencies into your code repository. It is suggested that you create a secrets yaml file in your local workstation and store it in a storage media or storage cloud service that supports encryption at rest to avoid unauthorized access.</b></p>

<p>Generating Kubernetes Secrets<br>
https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/
Secrets in kubernetes must be encoded to base64. To generate in Mac OS, open the terminal and execute the following command
   $ echo -n <b>secret-string</b> | base64
</p>

<p>To add the required secrets, via a Kubernetes API Secret object, use the following format on your own yaml file and apply to your cluster with the command: $ kubectl apply -f <i>secret-file-name</i>.yaml</p>

```yml
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

<p>You can also set secrets using the following imperative kubectl command:<br>
kubectl create secret generic mysecret --from-literal='cloudant_url=<b><i>url-string</i></b>' --from-literal='cloudant_user=<b><i>user-name-string</i></b>' --from-literal='cloudant_password=<b><i>password-string</i></b>'
</p>

<p>Next we will configure the toolchain service to handle the deployment of our microservice.<br>
To configure the IBM Cloud toolchain automation, follow these instructions:
</p>
<li>Log into IBM Cloud with your credentials</li>
<li>Navigate to your target IKS cluster overview page</li>
<li>Click on devops, from the left side menu</li>
<li>Click on Create a toolchain+ button</li>
<li>Click on the Develop a Kubernete app box</li>
<li>Add a Toolchain Name (e.g. simple-api)</li>
<li>Specify the region and the resource group that matches your IBM Kubernetes Service</li>
<li>Select a source provider: Git Repos and Issue Tracking</li>
<li>not needed: Authorize the toolchain automation to access your GitHub repository</li>
<li>Select Clone for the Repository type</li>
<li>Specify the Repository URL as https://github.com/jirau/simple-api </li>
<li>leave other values unchanged</li>
<li>click on Delivery pipeline tab</li>
<li>app name: w.g simple-api</li>
<li>provide an existing IBM Cloud API key or create a new key (link on instructions)</li>
<li>select a valid container registry-region (location doesn't have to match the cluster location)</li>
<li>select a valid registry namespace where you would like to have the toolchain upload images to</li>
<li>ensure cluster region, resource group, and cluster name all match your target cluster</li>
<li>Important: cluster namespace must match the kubernetes namespace you use for secrets</li>

what could go wrong?
- containers can't access your secrets (secrets created on the wrong namespace)


