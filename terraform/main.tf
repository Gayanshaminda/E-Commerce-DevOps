provider "aws" {
  region = "eu-north-1"
}

resource "aws_security_group" "ecommerce_sg" {
  name        = "E-commerce-security-group-v2"
  description = "Security group for E-Commerce app"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  
  }

  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "my_ec2" {
  ami           = "ami-09a9858973b288bdd"
  instance_type = "t3.micro"
  key_name      = "E-commerece-key-pair"
  security_groups = [aws_security_group.ecommerce_sg.name]

  tags = {
    Name = "MyEC2Instance"
  }
}

output "ssh_command" {
  value = "ssh -i ~/.ssh/E-commerece-key-pair.pem ubuntu@${aws_instance.my_ec2.public_ip}"
}
