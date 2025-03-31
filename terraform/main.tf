
variable "region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "eu-north-1"
}

provider "aws" {
  region = var.region
}

variable "environment" {
  description = "Deployment environment"
  default     = "dev"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "ecommerce-vpc"
  }
}

resource "aws_subnet" "main" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "eu-north-1a"
  map_public_ip_on_launch = true
  tags = {
    Name = "ecommerce-subnet"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "ecommerce-igw"
  }
}

resource "aws_route_table" "main" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = {
    Name = "ecommerce-rt"
  }
}

resource "aws_route_table_association" "main" {
  subnet_id      = aws_subnet.main.id
  route_table_id = aws_route_table.main.id
}

resource "aws_security_group" "ecommerce_sg" {
  name        = "ecommerce-security-group"
  description = "Security group for E-Commerce app"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access from anywhere"
  }

  ingress {
    from_port   = 5173
    to_port     = 5173
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Frontend access"
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Backend API access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "ecommerce-sg"
    Environment = var.environment
  }
}

resource "aws_instance" "my_ec2" {
  ami                    = "ami-09a9858973b288bdd"  # Ubuntu 22.04 in eu-north-1
  instance_type          = "t3.micro"
  key_name               = "E-commerece-key-pair"
  subnet_id              = aws_subnet.main.id
  vpc_security_group_ids = [aws_security_group.ecommerce_sg.id]  # Changed from security_groups
  user_data              = <<-EOF
    #!/bin/bash
    sudo apt-get update
    sudo apt-get install -y python3
  EOF

  tags = {
    Name = "EcommerceEC2"
  }
}

output "public_ip" {
  value = aws_instance.my_ec2.public_ip
}

output "ssh_command" {
  value = "ssh -i ~/.ssh/E-commerece-key-pair.pem ubuntu@${aws_instance.my_ec2.public_ip}"
}