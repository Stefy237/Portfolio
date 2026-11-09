terraform {
  required_version = ">= 1.6"

  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
      # Branche 4.x : la 5.x a renommé plusieurs ressources (ex. cloudflare_record → cloudflare_dns_record).
      version = "~> 4.52"
    }
  }

  # État local par défaut. Pour travailler à plusieurs endroits (ordinateur + CI),
  # passer à un backend distant.
}

provider "cloudflare" {
  # Le jeton est lu dans la variable d'environnement CLOUDFLARE_API_TOKEN :
  # il n'apparaît jamais dans le code ni dans l'état.
}
