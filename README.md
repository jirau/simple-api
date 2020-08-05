## Draft: Not Ready

### Tutorial: Deploying a cloud-native microservice in the IBM Kubernetes Service, going beyond deploying a Hello World application container.

By following this tutorial, you will be able to exercise all the steps necessary to deploy a cloud-native microservice in the IBM Kubernetes Service (IKS) by leveraging IBM Cloud's toolchain automation.

**Prerequisites**
* You will need an IBM Cloud Account. If you don't have one, you can sign up for a free [trial](https://cloud.ibm.com/).
* Verify that toolchains and tool integrations are available in your region and IBM Cloud environment.
* You will need a IBM Kubernetes Service cluster.
* You will need to provision an instance of the IBM Cloudant Database service.

For this tutorial, we will be deploying a simple cloud-native application, using the IBM Cloud toolchain to containerize, store the image on a private container registry and then deploy it to our target Kubernetes cluster.

We will use the code stored in this repository as our sample application microservice, which we will refer to as the **simple-api**.
The simple-api is a basic nodejs microservice that exposes data via a http RESTful API. The API is based on the loopback4 framework. You can find more information about the loopback framework [here](https://loopback.io/). In conjunction with the api, an IBM Cloud Cloudant Database is also needed and will be used as our data store.
The following diagram depicts how our application environment will look like after the automated deployment.

![Environment Overview](./images/env-overview.png)


To start, we need to first provision our Database service.

### Step 1: Provisioning and Configuring the IBM Cloudant Service
1. Log into your IBM Cloud Account
1. From the dashboard, click **|Create Resource+|**
1. Use the **|Search the catalog..|** bar and search for *Cloudant*
1. Click on the *Cloudant Service box* option
1. Change the Authentication method from IAM, to **IAM and legacy credentials**
1. Ensure Lite plan is selected (note: this is a free tier plan)
1. Leave all the other service options unchanged
1. Click **| Create |** on the lower right side of the screen

Next, we will need to create the necessary Cloudant service credentials, to allow our simple-api to read, write, delete our data.
1. On the Cloudant service page, click on Service Credentials
1. Then click, **|New Credentials+|**
1. On the Create credentials, select *Writer* as the Role: (Note: these credentials will be used on the next step to configure our Kubernetes deployment secrets and environment variables)

To finalize our Database configuration we must create a Database, which is will be exposed by our simple-api container.
1. On the Cloudant service page, click on Manage, and then click on the Launch Dashboard button and log with your IBMid credentials.
1. On the Database section of the Cloudant Dashboard, click on **|Create Database|** on the upper toolbar.
1. On the Create Database window, enter **'items'** (ensure all lower caps) as the Database name, click on the *Non-Partitioned radio button*, then click the **|Create|** button.
1. You can now close the dashboard, as no other steps are needed related to the Cloudant Database service.

### Step 2: Configuring and Applying Secrets to our IKS Cluster
To enable access from the microservice to the Cloudant Database Service, we need to securily share environment variables to simple-api pod containers via Kubernetes secrets.<br>
Kubernetes Secrets allow us to store and manage sensitive information, such as passwords, user access credentials, Authorization tokens, and ssh keys.

> **Note on service credentials and secrets:**<br>
> Never commit service credentials and secrets dependencies into your code repository. It is suggested that you create a secrets yaml file in your local workstation and store it in a secure location, such as storage media or a object storage cloud service that supports encryption at rest to avoid unauthorized access.

We will need to configure three **(3) Kubernetes secrets** to store our Cloudant services credentials, to enable access from the simple-api microservice container to the Database. These 3 variables are, 1) *cloudant_url*, 2) *cloudant_user*, 3) *cloudant_password*

**Generating Kubernetes Secrets**<br>
Secrets in kubernetes must be encoded in base64. To generate the base64 encoded strings in MacOS or Linux, open the terminal and execute the following commands for the 3 required credentials.<br> Alternatively, you can use a base64 online encoder.
```shell
$ echo -n < secret-string > | base64
```
Then, add the encoded strings to the corresponding data element in a Secret yaml file. note: you will need to create this file as it is not included in the code repository. Do not commit this file with your code.

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
Once you have the yaml file with the required encoded credentials, we can now proceed and apply it to our cluster, by using the following kubectl command:<br>
```shell
$ kubectl apply -f <secret-file-name>.yaml
```
Alternatively, you can also set secrets using the following imperative kubectl command:<br>
```shell
$ kubectl create secret generic mysecret --from-literal='cloudant_url=<url-string>' --from-literal='cloudant_user=<user-name-string>' --from-literal='cloudant_password=<password-string>'
```

[Click this link, for detailed instructions on creating and managing Kubernetes secrets](https://kubernetes.io/docs/tasks/inject-data-application/distribute-credentials-secure/)

### Step 3: Configuring the IBM Automated Toolchain
> We will use the toolchain clone option, to clone or copy the simple-api [code](https://github.com/jirau/simple-api.git)  into our own repository. As an alterntive, you could clone the code outside of the toolchain process and select the *Existing* repository option. (you will need to authorize the toolchain to access your repository)<br>
To simplify and to ensure tutorial completion success, we recommend you first follow the intructions as is, by using the clone option.

**Please be aware of the the following IBM Cloud toolchain dependencies for deploying containers on your IKS cluster:**<br>
There are two files that are required by the toolchain automation to deploy our microservice on the IBM Kuberenetes Service cluster. These two files are, a 1) **Dockerfile** and a 2) **deployment.yaml**
Docker builds images automatically by reading the instructions from the **Dockerfile**. The **Dockerfile** contains all the instructions and specifications, needed to build a given image.<br>
The **deployment.yaml** includes the Kubernetes deployment and service API objects with the specifications for our cluster master node to provision and manage our microservice resources. Additional objects could be added under this file, by using the **---** triple dash separator.


Next we will configure the toolchain service to handle the deployment of our microservice.<br>
To configure the IBM Cloud toolchain automation, follow these instructions:
1. Log into IBM Cloud with your credentials
1. Navigate to your target IKS cluster overview page
1. Click on devops, from the left side menu
1. Click on **|Create a toolchain+|** button
1. Click on the **|  Develop a Kubernete App  |** box
![image](./images/pick-a-template.png)
1. Next, add a Toolchain Name *(e.g. simple-api)*. Keep all the other options as is.
![image](./images/toolchain-config1.png)
1. Next, provide an existing IBM Cloud API key or create a new key [(link on instructions)](https://cloud.ibm.com/docs/account?topic=account-userapikey). You can also, create a new key in this screen, by clicking the **| New+ |** button.
![image](./images/toolchain-config2.png)
1. Next, select a valid container registry-region (location doesn't have to match the cluster location)
![image](./images/toolchain-config3.png)
1. Next, select a valid registry namespace where you would like to have the toolchain upload images to
1. Next, ensure cluster region, resource group, and cluster name all match your target cluster
Important: your cluster namespace must match the kubernetes namespace you used to store your kubernets secrets
1. Next, click **| Create |**

> Now that that the toolchain configuration is completed, you can follow progress and see detailed logging information by stage. From the toolchain Overview page, Click on the **|  Delivery Pipeline  |** box. You will be presented with the Delivery Pipeline page.
>![image](./images/toolchain-progress.png)
> From this page, and after all the stages have completed successfuly, click on the **DEPLOY** box, `view logs and history` to access the latest logs. To access the simple-app page, scroll all the way down towards the end of the log and click on the provided **IP Address**.
>![image](./images/container-address.png)


> what could go wrong?
> * containers can't access your secrets (secrets created on the wrong namespace)


