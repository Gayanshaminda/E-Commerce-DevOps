
provider "aws" {
  region = "eu-north-1"  
}

# EC2 instance resource definition
resource "aws_instance" "my_ec2" {
  ami           = "ami-09a9858973b288bdd"  
  instance_type = "t3.micro"  

  
  key_name = "E-commerece-key-pair"  

  # Security group for the instance
  security_groups = ["E-commerce-security-group"]  

 
  tags = {
    Name = "MyEC2Instance"
  }
}

# Output the public IP of the instance
output "public_ip" {
  value = aws_instance.my_ec2.public_ip
}
