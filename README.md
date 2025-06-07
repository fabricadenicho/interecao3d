# Galeria de Visualizações Científicas 3D

Uma plataforma educacional interativa com visualizações científicas imersivas em 3D, desenvolvida com React e Three.js.

## 🚀 Funcionalidades

### Visualizações Disponíveis

1. **Rede Neural Playground** 🧠
   - Arquitetura neural interativa em 3D
   - Camadas personalizáveis e animações de propagação
   - Visualização de conexões e ativações

2. **Simulador Atômico** ⚛️
   - Modelos atômicos com elétrons orbitando
   - Diferentes elementos químicos
   - Órbitas realistas e animações físicas

3. **Hélice de DNA** 🧬
   - Estrutura dupla hélice detalhada
   - Pares de bases nucleotídicas (A-T, G-C)
   - Rotação e zoom interativos

4. **Sistema Solar** 🌍
   - Sistema solar cinematográfico completo
   - 2000 estrelas de fundo
   - Planetas com atmosferas realistas
   - Anéis planetários e luas orbitantes
   - Cinturão de asteroides

5. **Campo de Partículas** ⚡
   - Simulação quântica de partículas
   - Diferentes modos: Ondas, Quântico, Interferência
   - Efeitos visuais dinâmicos

6. **Superfície Matemática** 📐
   - 5 funções matemáticas interativas:
     - Função Sinc
     - Ondas Senoidais
     - Ondas de Ripple
     - Sela Hiperbólica
     - Ondas Exponenciais
   - Controles de frequência X/Y e amplitude
   - Esquemas de cores Cool-to-Warm e Hot
   - Modo wireframe opcional

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **3D Engine**: Three.js + @react-three/fiber
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Express.js + Node.js
- **State Management**: Zustand
- **Build Tool**: Vite

## 📦 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/galeria-visualizacoes-3d.git
cd galeria-visualizacoes-3d
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra http://localhost:5000 no seu navegador

## 🎮 Como Usar

1. **Navegação**: Use o menu principal para selecionar uma visualização
2. **Controles 3D**: 
   - Mouse para rotacionar a câmera
   - Scroll para zoom
   - Arrastar para mover
3. **Parâmetros**: Ajuste os controles na interface para modificar as visualizações
4. **Animação**: Toggle de animação disponível em várias visualizações

## 📁 Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   ├── ui/       # Componentes UI base
│   │   │   └── visualizations/ # Visualizações 3D
│   │   ├── lib/          # Utilitários e stores
│   │   └── pages/        # Páginas da aplicação
│   └── public/           # Assets estáticos
├── server/               # Backend Express
├── shared/              # Schemas compartilhados
└── README.md
```

## 🎨 Características Técnicas

### Performance
- Renderização otimizada com Three.js
- Animações fluidas a 60 FPS
- Geometrias otimizadas para dispositivos móveis

### Responsividade
- Interface adaptável para desktop e mobile
- Controles touch otimizados
- Layout responsivo

### Educacional
- Descrições detalhadas em português
- Parâmetros interativos para experimentação
- Visualizações baseadas em conceitos científicos reais

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção

## 📸 Screenshots

![Sistema Solar](docs/solar-system.png)
![Superfície Matemática](docs/math-surface.png)
![Rede Neural](docs/neural-network.png)

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para educação científica interativa.

## 🙏 Agradecimentos

- Three.js community
- React Three Fiber team
- shadcn/ui components
- Conceitos científicos baseados em literatura acadêmica