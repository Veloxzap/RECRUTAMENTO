# Sistema de Recrutamento HM

Sistema moderno para gestão de candidatos, vagas e locais de teste, desenvolvido para o Hospital da Mulher.

## 🚀 Funcionalidades
- **Dashboard Interativo**: Visão geral de vagas, candidatos agendados e contratados.
- **Gestão de Candidatos**: Cadastro completo, filtros por agendamento, resultado e status de contratação.
- **Gestão de Vagas**: Controle de vagas disponíveis por cargo e período.
- **Exportação**: Geração de relatórios em PDF.
- **Automação**: Aprovação automática ao marcar para contratação.

## 🛠️ Tecnologias
- **Frontend**: React + TypeScript + Vite
- **Banco de Dados**: Supabase (PostgreSQL)
- **Estilização**: Tailwind CSS (Design Premium/Glassmorphism)
- **Ícones**: Lucide React

## ☁️ Deployment (Cloudflare Pages)

O projeto está configurado para deploy automático via GitHub no Cloudflare Pages.

### Configurações Necessárias:
1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Variáveis de Ambiente**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

O arquivo `public/_redirects` já está presente para garantir o funcionamento das rotas SPA.
