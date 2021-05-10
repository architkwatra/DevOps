import boto3
from botocore.exceptions import ClientError
import os
from json import loads
from urllib.request import urlopen

instance = 'ec2'
region = 'us-east-1'
imageName = 'ami-042e8287309f5df03' #'ami-0742b4e673072066f' #'ami-0018ef16'
instanceType = "t2.medium"
key_name = "ec2"
instance_id = "i-002fb1b638777af2c"
ec2_client = boto3.client(instance, region_name=region)
ec2_resources = boto3.resource(instance, region_name=region)
minimum_instances = 3
maxmum_instances = 3

# iniFileTemplate = "[itrust]\n\nansible_ssh_private_key_file=/bakerx/aws/ec2.pem ansible_user=ubuntu\n\n[itrust:vars]\n\nansible_ssh_common_args='-o StrictHostKeyChecking=no'\n\n\n[checkbox]\n\nansible_ssh_private_key_file=/bakerx/aws/ec2.pem ansible_user=ubuntu\n\n[checkbox:vars]\n\nansible_ssh_common_args='-o StrictHostKeyChecking=no'\n\n\n[monitor]\n\nansible_ssh_private_key_file=/bakerx/aws/ec2.pem ansible_user=ubuntu\n\n[monitor:vars]\n\nansible_ssh_common_args='-o StrictHostKeyChecking=no'"
def createIniFile(ipAddresses):
    iniFileTemplate = "[itrust]\n\nansible_ssh_private_key_file=/bakerx/aws/ec2.pem ansible_user=ubuntu\n\n[itrust:vars]\n\nansible_ssh_common_args='-o StrictHostKeyChecking=no'\n\n\n[checkbox]\n\nansible_ssh_private_key_file=/bakerx/aws/ec2.pem ansible_user=ubuntu\n\n[checkbox:vars]\n\nansible_ssh_common_args='-o StrictHostKeyChecking=no'\n\n\n[monitor]\n\nansible_ssh_private_key_file=/bakerx/aws/ec2.pem ansible_user=ubuntu\n\n[monitor:vars]\n\nansible_ssh_common_args='-o StrictHostKeyChecking=no'"
    # iniFileTemplate = "[itrust]\n\nansible_ssh_private_key_file=/bakerx/aws/ec2.pem ansible_user=ubuntu\n\n[itrust:vars]\n\nansible_ssh_common_args='-o StrictHostKeyChecking=no'"
    # iniFileTemplate = "[checkbox]\n\nansible_ssh_private_key_file=/bakerx/aws/ec2.pem ansible_user=ubuntu\n\n[checkbox:vars]\n\nansible_ssh_common_args='-o StrictHostKeyChecking=no'"
    
    i = 0
    with open("inventory.ini", "w") as f:
        ini = iniFileTemplate.split("\n")
        for text in ini:
            temp = text
            if text[:len('ansible_ssh_private_key_file')] == 'ansible_ssh_private_key_file':
                temp = ipAddresses[i] + " " + temp
                i += 1
            if text == "":
                temp = "\n"
            f.write(temp)

def delete_old_key_pair():
    try:
        response = ec2_client.delete_key_pair(KeyName=key_name)
        print("\ndeleted_key_pair = ", response)
    except Exception as e:
        print(e)

delete_old_key_pair()

def create_key_pair():
    key_pair = ec2_client.create_key_pair(KeyName=key_name)
    private_key = key_pair["KeyMaterial"]
    # write private key to file with 400 permissions
    with os.fdopen(os.open("ec2.pem", os.O_WRONLY | os.O_CREAT, 0o400), "w+") as handle:
    # with open("home/vagrant/.ssh/authorized_keys", "r+") as handle:
        handle.write("\n")
        handle.write(private_key)

create_key_pair()

def create_instance():
    instances = ec2_client.run_instances(
        ImageId=imageName,
        MinCount=minimum_instances,
        MaxCount=maxmum_instances,
        InstanceType=instanceType,
        KeyName=key_name
    )

    instance_ids = [instance["InstanceId"] for instance in instances["Instances"]]
    waiter = ec2_client.get_waiter('instance_running')
    waiter.wait(InstanceIds=instance_ids)
    
    sg = ec2_client.describe_security_groups()
    securityGroupId = sg['SecurityGroups'][0]['GroupId']

    
    # print("returning ids = ", instance_ids)
    return instance_ids, securityGroupId

instance_ids, securityGroupId = create_instance()

def print_ip_addresses():
    instances = ec2_resources.instances.filter(
        Filters=[{'Name': 'instance-state-name', 'Values': ['running']}])
    ipAddresses = []
    for instance in instances:
        # print(f"instance id = {instance.id}, instance_type = {instance.instance_type}")
        # print(f"private ip address = {instance.private_ip_address}")
        # print(f"public ip address = {instance.public_ip_address}")
        ipAddresses.append(instance.public_ip_address)
        # print("XXXXXXXXXXXXXXXXXXs\n")
    # print(ipAddresses)
    createIniFile(ipAddresses)

print_ip_addresses()

def addSecurityGroupIngressRules(securityGroupId):
    try:
        security_group = ec2_resources.SecurityGroup(securityGroupId)
    except Exception as e:
        print(e)

    try:
        data = loads(urlopen("http://httpbin.org/ip").read())
        res = security_group.authorize_ingress(CidrIp=str(data["origin"]) + "/32", IpProtocol='tcp', FromPort=22, ToPort=22)
    except Exception as e:
        print(e)
    
    try:
        res = security_group.authorize_ingress(IpProtocol="ICMP",CidrIp="0.0.0.0/0",FromPort=-1,ToPort=-1)
    except Exception as e:
        print(e)

# addSecurityGroupIngressRules(securityGroupId)

def stop_instance(instance_id = instance_id):
    response = ec2_client.stop_instances(InstanceIds=[instance_id])
    print(response)

def terminate_instance(instance_id = instance_id):    
    response = ec2_client.terminate_instances(InstanceIds=[instance_id])
    print(response)


