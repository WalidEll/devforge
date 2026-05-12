---
title: "How to Create a Production-Ready VPC in GCP"
slug: "create-production-ready-vpc-in-gcp"
description: "Build a custom Google Cloud VPC with two subnets, a scoped firewall rule, and a validation VM using the Console, gcloud CLI, and modern Terraform."
category: "networking"
difficulty: "intermediate"
keywords:
  - production gcp vpc
  - custom vpc gcp
  - gcp subnet tutorial
  - gcp firewall rules
  - gcloud vpc create
  - terraform google provider
  - compute engine vm
  - google cloud networking
icon: "VPC"
readingTime: 18
date: "2026-05-12"
relatedSlugs:
  - gcp-vpc-beginner-guide
  - docker-fundamentals
  - linux-file-permissions
toolSlugs:
  - ipv4-subnet-calculator
  - ipv4-range-expander
---

## Why custom VPCs matter

Production networks need predictable IP ranges, clear segmentation, and firewall rules that match real workloads. The default VPC is convenient for experiments, but it creates broad defaults you usually spend time undoing later.

This tutorial builds a small production-shaped baseline:

- One custom VPC named **prod-core-vpc**
- Two subnets named **prod-us-central1-app-snet** and **prod-us-central1-mgmt-snet**
- One ingress firewall rule named **prod-allow-admin-ssh**
- One validation VM named **prod-app-vm-01**

The example keeps the validation VM simple so you can prove the network works end to end. For a real production rollout, remove public IPs, use IAP or VPN for administration, and add Cloud NAT for outbound internet access.

## Auto mode vs custom mode

Google Cloud offers two VPC subnet modes:

- **Auto mode** creates one subnet in each region automatically. That is fast for labs, but it gives you less control over CIDR planning and can waste address space.
- **Custom mode** makes you define each subnet yourself. That is what most production teams want because it keeps IP ranges intentional, repeatable, and easier to audit.

Use **custom mode** when you care about:

- Keeping dev, staging, and prod address plans separate
- Reserving room for future regional expansion
- Turning on subnet-level settings such as Private Google Access and flow logs
- Avoiding accidental overlap with on-prem, VPN, or peered networks

A practical naming convention is **`<environment>-<region>-<workload>-<type>`**:

- VPC: **prod-core-vpc**
- Subnet: **prod-us-central1-app-snet**
- Firewall rule: **prod-allow-admin-ssh**
- VM: **prod-app-vm-01**

## Creating the VPC

In the Google Cloud Console, go to **VPC network > VPC networks > Create VPC network**. Set the name to **prod-core-vpc**, choose **Custom** subnet creation mode, and leave dynamic routing mode at **Regional** unless you already know you need global route propagation for hybrid networking.

If you prefer the CLI, set your project and create the VPC directly:

```bash
gcloud config set project PROJECT_ID
gcloud config set compute/region us-central1

gcloud compute networks create prod-core-vpc \
  --subnet-mode=custom \
  --bgp-routing-mode=regional \
  --description="Production VPC for application and management workloads"
```

Why use **Regional** routing mode here? It is the safer default for single-region or lightly distributed environments because route visibility stays tighter. If you run multi-region hybrid connectivity and need dynamic routes visible across regions, switch to **Global** deliberately.

## Creating subnets

A custom VPC is empty until you define subnets. In this tutorial, both subnets live in **us-central1**, but they serve different roles:

- **prod-us-central1-app-snet**: `10.10.10.0/24`
- **prod-us-central1-mgmt-snet**: `10.10.20.0/24`

In the Console, either add the subnets while creating the VPC or open the VPC afterward and select **Add subnet**. For each subnet, choose **us-central1**, set the CIDR range, enable **Private Google Access**, and enable **Flow logs**.

The equivalent CLI commands are:

```bash
gcloud compute networks subnets create prod-us-central1-app-snet \
  --network=prod-core-vpc \
  --region=us-central1 \
  --range=10.10.10.0/24 \
  --enable-private-ip-google-access \
  --enable-flow-logs

gcloud compute networks subnets create prod-us-central1-mgmt-snet \
  --network=prod-core-vpc \
  --region=us-central1 \
  --range=10.10.20.0/24 \
  --enable-private-ip-google-access \
  --enable-flow-logs
```

Production tip: carve CIDR ranges by environment first, then by region, then by workload. A simple pattern is **`10.<env>.<region>.<subnet>/24`** or a larger regional block such as **`10.10.0.0/16`** for one region that you split later into smaller subnets.

## Creating firewall rules

GCP firewall rules are stateful and defined at the VPC level, but they are enforced on instances. That means you should target rules as narrowly as possible with tags or service accounts.

For this tutorial, create one ingress rule that allows SSH and ICMP only from a trusted admin range. In the Console, go to **VPC network > Firewall > Create firewall rule** and set:

1. Name: **prod-allow-admin-ssh**
2. Network: **prod-core-vpc**
3. Direction: **Ingress**
4. Targets: **Specified target tags**
5. Target tags: **admin-access**
6. Source IPv4 ranges: your office or home public IP as a CIDR such as **203.0.113.10/32**
7. Allowed protocols and ports: **tcp:22** and **icmp**
8. Logging: **On**

The CLI version looks like this:

```bash
gcloud compute firewall-rules create prod-allow-admin-ssh \
  --network=prod-core-vpc \
  --direction=INGRESS \
  --priority=1000 \
  --allow=tcp:22,icmp \
  --source-ranges=203.0.113.10/32 \
  --target-tags=admin-access \
  --enable-logging
```

Do not use **0.0.0.0/0** for SSH in production. If your admin source changes often, prefer **IAP TCP forwarding** or a VPN instead of widening the firewall rule.

## Deploying a VM

In the Console, go to **Compute Engine > VM instances > Create instance**. Use the name **prod-app-vm-01**, choose a zone such as **us-central1-a**, pick a modest machine type such as **e2-medium**, and attach the VM to **prod-us-central1-app-snet**. Add the network tag **admin-access** so the firewall rule applies.

For a quick hands-on validation, an ephemeral external IP is acceptable. For a real production workload, choose **No external IPv4 address**, keep **Private Google Access** enabled on the subnet, and use IAP, VPN, or a bastion plus Cloud NAT for outbound traffic.

The deployment commands and Terraform stack are:

```text
# gcloud CLI
gcloud compute instances create prod-app-vm-01 \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --subnet=prod-us-central1-app-snet \
  --tags=admin-access,app \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --metadata=enable-oslogin=TRUE

# Terraform: main.tf
terraform {
  required_version = ">= 1.7.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }
}

variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "zone" {
  type    = string
  default = "us-central1-a"
}

variable "admin_cidr" {
  type        = string
  description = "Trusted admin source range in CIDR notation."
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

locals {
  env           = "prod"
  vpc_name      = "${local.env}-core-vpc"
  app_subnet    = "${local.env}-${var.region}-app-snet"
  mgmt_subnet   = "${local.env}-${var.region}-mgmt-snet"
  firewall_name = "${local.env}-allow-admin-ssh"
  vm_name       = "${local.env}-app-vm-01"
}

data "google_compute_image" "debian_12" {
  family  = "debian-12"
  project = "debian-cloud"
}

resource "google_compute_network" "main" {
  name                    = local.vpc_name
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
  mtu                     = 1460
}

resource "google_compute_subnetwork" "app" {
  name                     = local.app_subnet
  region                   = var.region
  ip_cidr_range            = "10.10.10.0/24"
  network                  = google_compute_network.main.id
  private_ip_google_access = true

  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

resource "google_compute_subnetwork" "mgmt" {
  name                     = local.mgmt_subnet
  region                   = var.region
  ip_cidr_range            = "10.10.20.0/24"
  network                  = google_compute_network.main.id
  private_ip_google_access = true

  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

resource "google_compute_firewall" "admin_ssh" {
  name    = local.firewall_name
  network = google_compute_network.main.name

  direction     = "INGRESS"
  priority      = 1000
  source_ranges = [var.admin_cidr]
  target_tags   = ["admin-access"]

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  allow {
    protocol = "icmp"
  }

  log_config {
    metadata = "INCLUDE_ALL_METADATA"
  }
}

resource "google_compute_instance" "app_vm" {
  name         = local.vm_name
  zone         = var.zone
  machine_type = "e2-medium"
  tags         = ["admin-access", "app"]

  boot_disk {
    initialize_params {
      image = data.google_compute_image.debian_12.self_link
      size  = 20
      type  = "pd-balanced"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.app.id

    # Remove this block for a private-only production VM.
    access_config {}
  }

  metadata = {
    enable-oslogin = "TRUE"
  }

  shielded_instance_config {
    enable_secure_boot          = true
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }

  labels = {
    env     = local.env
    managed = "terraform"
    role    = "app"
  }
}

output "vm_internal_ip" {
  value = google_compute_instance.app_vm.network_interface[0].network_ip
}

output "vm_external_ip" {
  value = try(google_compute_instance.app_vm.network_interface[0].access_config[0].nat_ip, null)
}
```

Apply the Terraform stack with **terraform init**, **terraform plan -var="project_id=PROJECT_ID" -var="admin_cidr=203.0.113.10/32"**, and **terraform apply**. Replace the sample CIDR with your real trusted source range before you run it.

## Connectivity testing

Validation should prove three things: the VM landed in the right subnet, the firewall rule applies only to the tagged instance, and you can administer the machine from the approved source.

In the Console, check the VM's **Internal IP** and confirm it falls inside **10.10.10.0/24**. Then inspect the VM's **Network interfaces** and **Tags**. If SSH fails, review **VPC network > Firewall** and the VM serial console or OS Login settings before changing the rule.

Use the CLI to verify the network details and log in:

```bash
gcloud compute instances describe prod-app-vm-01 \
  --zone=us-central1-a \
  --format="table(name,zone,tags.items,networkInterfaces[0].networkIP,networkInterfaces[0].accessConfigs[0].natIP)"

gcloud compute ssh prod-app-vm-01 --zone=us-central1-a

# Run these on the VM after SSH succeeds
hostname -I
ping -c 3 8.8.8.8
curl -I https://www.googleapis.com
```

For a negative test, try connecting from a network that is not in the trusted CIDR. SSH should fail. That matters just as much as the successful test because it proves the firewall rule is actually scoped.

## Production best practices

- Start with **custom mode VPCs** and a written IP allocation plan before you create resources.
- Reserve address space by **environment and region** so future subnets do not overlap with VPN, peering, or on-prem routes.
- Keep **public IPs off by default**. For admin access, prefer **IAP**, **VPN**, or a hardened bastion.
- Turn on **subnet flow logs** and **firewall rule logging** so you can investigate incidents later.
- Use **network tags** or, better yet, **service accounts** to target firewall rules narrowly.
- Enable **OS Login** and **Shielded VMs** on Compute Engine instances.
- Treat Terraform as the source of truth and avoid one-off Console changes after the first deployment.
- Add **labels** for ownership, environment, cost center, and workload so filtering and billing stay manageable.
- Keep VPC routing mode **Regional** unless you have a specific hybrid or multi-region reason to use **Global**.
- If several application projects need shared connectivity, evaluate **Shared VPC** instead of duplicating the same network design across projects.

## Cleanup steps

Delete resources in reverse dependency order: VM first, then firewall rules, then subnets, then the VPC. If you used the Console, remove them from **Compute Engine** and **VPC network**. If you used the CLI or Terraform, the commands are:

```bash
# gcloud cleanup
gcloud compute instances delete prod-app-vm-01 --zone=us-central1-a
gcloud compute firewall-rules delete prod-allow-admin-ssh
gcloud compute networks subnets delete prod-us-central1-app-snet --region=us-central1
gcloud compute networks subnets delete prod-us-central1-mgmt-snet --region=us-central1
gcloud compute networks delete prod-core-vpc

# Terraform cleanup
terraform destroy \
  -var="project_id=PROJECT_ID" \
  -var="admin_cidr=203.0.113.10/32"
```

If the VPC delete fails, a dependent resource still exists. Re-check forwarding rules, private service connections, extra NICs, or test VMs that were added after the initial setup.

## FAQ

**Should I create one VPC per environment?** Usually yes. Separate dev, staging, and prod VPCs make blast radius, IAM, and IP planning easier to reason about. The common exception is a Shared VPC model where host and service projects are used intentionally.

**Why did this tutorial use two subnets in one region instead of two regions?** Because the goal is to teach segmentation first. Once the pattern is clear, you can repeat it in other regions with new non-overlapping CIDR blocks.

**When should I switch routing mode from Regional to Global?** Use **Global** only when you need dynamically learned routes to be visible across regions, typically in hybrid or advanced multi-region environments.

**Do I need a public IP on the VM?** No. It is only there to keep the validation path simple. In production, remove the external IP and use IAP, VPN, or a bastion for administration plus Cloud NAT for egress.

**Why enable Private Google Access on both subnets?** It lets VMs without external IPs reach Google APIs and services privately, which becomes important as soon as you move to private-only instances.

**Can I start with auto mode and migrate later?** You can, but it usually creates avoidable cleanup work. If you already know the environment is headed for production, start with custom mode from day one.
