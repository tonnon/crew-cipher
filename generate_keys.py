#!/usr/bin/env python3
"""
Script para gerar as chaves necessárias para deploy na Vercel
"""

import secrets
from cryptography.fernet import Fernet

print("=" * 60)
print("CHAVES PARA CONFIGURAR NA VERCEL")
print("=" * 60)
print()

print("1. DOOR_UNLOCK_CODE (escolha qualquer código):")
print("   Exemplo: SETOR13LIBERADO")
print()

print("2. SECRET_KEY:")
secret_key = secrets.token_hex(32)
print(f"   {secret_key}")
print()

print("3. FERNET_KEY:")
fernet_key = Fernet.generate_key().decode()
print(f"   {fernet_key}")
print()

print("=" * 60)
print("COPIE ESTES VALORES E ADICIONE NA VERCEL:")
print("Settings → Environment Variables")
print("=" * 60)
