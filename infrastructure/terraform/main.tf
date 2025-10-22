terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-k8s-todo-${var.environment}"
  location = var.location

  tags = {
    environment = var.environment
    project     = "k8s-todo"
    managed_by  = "terraform"
  }
}

# Azure Container Registry
resource "azurerm_container_registry" "main" {
  name                = "acrk8stodo${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true

  tags = {
    environment = var.environment
    project     = "k8s-todo"
    managed_by  = "terraform"
  }
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "main" {
  name                = "aks-k8s-todo-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "k8stodo${var.environment}"

  node_resource_group = "rg-k8s-todo-${var.environment}-nodes"

  default_node_pool {
    name       = "default"
    node_count = var.node_count
    vm_size    = var.node_size
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = "azure"
    network_policy = "azure"
  }

  tags = {
    environment = var.environment
    project     = "k8s-todo"
    managed_by  = "terraform"
  }
}

# Grant AKS pull access to ACR
resource "azurerm_role_assignment" "acr_pull" {
  principal_id                     = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.main.id
  skip_service_principal_aad_check = true
}

# Azure Database for PostgreSQL
resource "azurerm_postgresql_flexible_server" "main" {
  name                = "psql-k8s-todo-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  # Version 16 (latest stable)
  version = "16"

  # Basic tier for dev (can scale up later)
  sku_name = "B_Standard_B1ms"

  # Storage
  storage_mb = 32768 # 32 GB minimum

  # Authentication
  administrator_login    = var.postgres_admin_username
  administrator_password = var.postgres_admin_password

  # High availability disabled for dev (saves cost)
  zone = "1"

  # Backups
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false

  tags = {
    environment = var.environment
    project     = "k8s-todo"
    managed_by  = "terraform"
  }
}

# Firewall rule - Allow AKS to connect
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_aks" {
  name             = "allow-aks"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0" # Allow all Azure services
  end_ip_address   = "0.0.0.0" # (AKS is inside Azure network)
}

# Database
resource "azurerm_postgresql_flexible_server_database" "todos" {
  name      = "todos"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}