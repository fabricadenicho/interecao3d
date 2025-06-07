# Como Subir o Projeto para o GitHub

## Pré-requisitos
- Ter uma conta no GitHub
- Ter o Git instalado na sua máquina

## Passo a Passo

### 1. Criar Repositório no GitHub
1. Acesse [github.com](https://github.com)
2. Clique em "New repository" (ou o botão verde "New")
3. Nome sugerido: `galeria-visualizacoes-3d`
4. Descrição: `Plataforma educacional com visualizações científicas 3D interativas`
5. Deixe como **público** se quiser que outros vejam
6. **NÃO** marque "Add a README file" (já temos um)
7. Clique em "Create repository"

### 2. Comandos para Executar no Terminal

```bash
# 1. Inicializar repositório Git (se ainda não foi feito)
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer o primeiro commit
git commit -m "🚀 Projeto inicial: Galeria de Visualizações Científicas 3D

- 6 visualizações interativas: Rede Neural, Átomo, DNA, Sistema Solar, Partículas, Matemática
- Interface em português com controles intuitivos
- Sistema solar cinematográfico com 2000 estrelas
- Superfície matemática com 5 funções diferentes
- Controles responsivos para desktop e mobile"

# 4. Adicionar a origem remota (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/galeria-visualizacoes-3d.git

# 5. Renomear branch para main (padrão atual do GitHub)
git branch -M main

# 6. Fazer push inicial
git push -u origin main
```

### 3. Para Atualizações Futuras

```bash
# Adicionar mudanças
git add .

# Commit com mensagem descritiva
git commit -m "Descrição das mudanças"

# Enviar para GitHub
git push
```

### 4. Exemplo de URL Final
Seu projeto estará disponível em:
`https://github.com/SEU_USUARIO/galeria-visualizacoes-3d`

## Dicas Importantes

- **Substitua `SEU_USUARIO`** pelo seu username real do GitHub
- O arquivo `.gitignore` já está configurado para ignorar `node_modules` e outros arquivos desnecessários
- O README.md já está pronto com toda a documentação
- A licença MIT já está incluída

## Comandos Git Úteis

```bash
# Ver status dos arquivos
git status

# Ver histórico de commits
git log --oneline

# Ver diferenças antes de commit
git diff

# Desfazer mudanças em um arquivo
git checkout -- nome-do-arquivo

# Ver repositórios remotos
git remote -v
```

## Deploy Automático (Opcional)

Depois de subir para o GitHub, você pode configurar deploy automático usando:
- **Vercel** (recomendado para React)
- **Netlify**
- **GitHub Pages**

Essas plataformas detectam automaticamente projetos React/Vite e fazem o build e deploy.