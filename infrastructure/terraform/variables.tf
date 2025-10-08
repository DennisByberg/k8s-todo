variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "swedencentral"
}

variable "node_count" {
  description = "Number of AKS nodes"
  type        = number
  default     = 1 # 1 node för demo (sparar 50%)
}

variable "node_size" {
  description = "VM size for AKS nodes"
  type        = string
  default     = "Standard_B2s"
}