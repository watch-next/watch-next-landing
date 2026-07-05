<template>
  <div class="legal-page">
    <div class="container">
      <nav class="legal-back">
        <router-link to="/" class="legal-back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {{ $t('legal.backToHome') }}
        </router-link>
      </nav>
      <article class="legal-content">
        <header class="legal-header">
          <h1 class="legal-title">Política de Privacidade</h1>
          <p class="legal-subtitle">Última atualização: 5 de julho de 2026</p>
        </header>

        <section class="legal-section">
          <h2>1. Introdução</h2>
          <p>O WatchNext ("nós", "nosso" ou "plataforma") respeita sua privacidade e está comprometido em proteger seus dados pessoais. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações quando você utiliza nossos serviços.</p>
          <p>Ao acessar ou usar o WatchNext, você concorda com as práticas descritas nesta política. Se não concordar com algum termo, por favor, não utilize nossos serviços.</p>
        </section>

        <section class="legal-section">
          <h2>2. Informações que Coletamos</h2>

          <h3>2.1 Informações Fornecidas Diretamente por Você</h3>
          <ul>
            <li><strong>Informações de cadastro:</strong> nome, endereço de e-mail e senha quando você cria uma conta.</li>
            <li><strong>Informações de perfil:</strong> foto de perfil, preferências de idioma e configurações pessoais.</li>
            <li><strong>Comunicações:</strong> quando você entra em contato conosco para suporte ou envia feedback.</li>
            <li><strong>Newsletter:</strong> endereço de e-mail quando você se inscreve para receber atualizações.</li>
          </ul>

          <h3>2.2 Informações Coletadas Automaticamente</h3>
          <ul>
            <li><strong>Dados de uso:</strong> páginas visitadas, tempo de sessão, recursos utilizados e interações com a plataforma.</li>
            <li><strong>Dados do dispositivo:</strong> tipo de dispositivo, sistema operacional, navegador e endereço IP.</li>
            <li><strong>Histórico de visualização:</strong> filmes e séries que você marca como assistidos ou adiciona às suas listas.</li>
            <li><strong>Preferências:</strong> gêneros favoritos, serviços de streaming vinculados e configurações de notificação.</li>
          </ul>

          <h3>2.3 Informações de Terceiros</h3>
          <ul>
            <li><strong>Serviços de autenticação:</strong> quando você se conecta através de contas de terceiros (Google, Apple, etc.).</li>
            <li><strong>APIs de conteúdo:</strong> informações de bancos de dados de filmes e séries (TMDb, IMDb, etc.).</li>
            <li><strong>Analytics:</strong> dados agregados de ferramentas de análise de uso.</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>3. Como Usamos Suas Informações</h2>
          <p>Utilizamos suas informações para as seguintes finalidades:</p>
          <ul>
            <li><strong>Prestação de serviços:</strong> operar e manter a plataforma, processar cadastros e gerenciar sua conta.</li>
            <li><strong>Personalização:</strong> oferecer recomendações personalizadas e melhorar sua experiência de uso.</li>
            <li><strong>Comunicação:</strong> enviar atualizações sobre a plataforma, novidades e respostas a solicitações de suporte.</li>
            <li><strong>Melhoria contínua:</strong> analisar o uso da plataforma para desenvolver novos recursos e otimizações.</li>
            <li><strong>Segurança:</strong> detectar e prevenir fraudes, acesso não autorizado e outras atividades maliciosas.</li>
            <li><strong>Cumprimento legal:</strong> atender a obrigações legais e regulatórias aplicáveis.</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>4. Compartilhamento de Dados</h2>
          <p>Não vendemos seus dados pessoais. Podemos compartilhar informações apenas nas seguintes circunstâncias:</p>
          <ul>
            <li><strong>Prestadores de serviços:</strong> empresas que nos auxiliam na operação da plataforma (hospedagem, analytics, suporte).</li>
            <li><strong>Requisitos legais:</strong> quando exigido por lei, ordem judicial ou autoridade competente.</li>
            <li><strong>Proteção de direitos:</strong> para proteger nossos direitos, propriedade ou segurança e de nossos usuários.</li>
            <li><strong>Consentimento:</strong> quando você autorizar expressamente o compartilhamento.</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>5. Armazenamento e Segurança</h2>
          <p>Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, perda, alteração ou divulgação indevida. Isso inclui:</p>
          <ul>
            <li>Criptografia de dados em trânsito e em repouso.</li>
            <li>Acesso restrito a informações pessoais apenas por pessoal autorizado.</li>
            <li>Monitoramento contínuo de sistemas contra vulnerabilidades.</li>
            <li>Backups regulares e planos de recuperação de desastres.</li>
          </ul>
          <p>Apesar de nossos esforços, nenhum sistema é 100% seguro. Caso identifiquem qualquer vulnerabilidade, pedimos que nos comuniquem imediatamente.</p>
        </section>

        <section class="legal-section">
          <h2>6. Cookies e Tecnologias de Rastreamento</h2>
          <p>Utilizamos cookies e tecnologias similares para:</p>
          <ul>
            <li><strong>Essenciais:</strong> permitir o funcionamento básico da plataforma e autenticação.</li>
            <li><strong>Preferências:</strong> memorizar suas configurações e idioma.</li>
            <li><strong>Analytics:</strong> entender como os usuários interagem com nossos serviços.</li>
          </ul>
          <p>Você pode configurar seu navegador para recusar cookies, mas algumas funcionalidades da plataforma podem não operar corretamente.</p>
        </section>

        <section class="legal-section">
          <h2>7. Seus Direitos</h2>
          <p>Dependendo da sua jurisdição, você pode ter os seguintes direitos sobre seus dados:</p>
          <ul>
            <li><strong>Acesso:</strong> solicitar uma cópia das informações que mantemos sobre você.</li>
            <li><strong>Correção:</strong> retificar dados incorretos ou desatualizados.</li>
            <li><strong>Exclusão:</strong> pedir a remoção de seus dados pessoais de nossos sistemas.</li>
            <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado e legível.</li>
            <li><strong>Oposição:</strong> opor-se ao processamento de seus dados para determinadas finalidades.</li>
            <li><strong>Revogação:</strong> retirar consentimentos previamente concedidos.</li>
          </ul>
          <p>Para exercer seus direitos, entre em contato conosco através do e-mail <a href="mailto:privacy@watchnext.app">privacy@watchnext.app</a>.</p>
        </section>

        <section class="legal-section">
          <h2>8. Retenção de Dados</h2>
          <p>Mantemos suas informações enquanto sua conta estiver ativa ou pelo tempo necessário para cumprir as finalidades descritas nesta política. Após o encerramento da conta, retemos dados apenas quando necessário para:</p>
          <ul>
            <li>Cumprir obrigações legais ou regulatórias.</li>
            <li>Resolver disputas ou fazer cumprir nossos acordos.</li>
            <li>Prevenir fraudes ou atividades maliciosas.</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>9. Transferências Internacionais</h2>
          <p>O WatchNext opera globalmente e seus dados podem ser transferidos para países fora do seu país de residência. Garantimos que tais transferências observem padrões adequados de proteção de dados e cumpram a legislação aplicável.</p>
        </section>

        <section class="legal-section">
          <h2>10. Privacidade de Menores</h2>
          <p>Nossos serviços não são direcionados a menores de 13 anos e não coletamos intencionalmente informações de crianças desta faixa etária. Caso tomemos conhecimento de que coletamos dados de um menor de 13 anos sem consentimento parental verificável, excluiremos tais informações prontamente.</p>
        </section>

        <section class="legal-section">
          <h2>11. Alterações a Esta Política</h2>
          <p>Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas ou requisitos legais. A versão atualizada será publicada nesta página com a data de última modificação. Alterações significativas serão comunicadas através de notificação na plataforma ou por e-mail.</p>
          <p>Incentivamos que você revise esta política regularmente para permanecer informado sobre como protegemos suas informações.</p>
        </section>

        <section class="legal-section">
          <h2>12. Contato</h2>
          <p>Se tiver dúvidas, preocupações ou solicitações relacionadas a esta Política de Privacidade, entre em contato conosco:</p>
          <ul>
            <li><strong>E-mail:</strong> <a href="mailto:privacy@watchnext.app">privacy@watchnext.app</a></li>
            <li><strong>Endereço:</strong> WatchNext Privacy Team</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>13. Disposições Finais</h2>
          <p>Esta Política de Privacidade é regida pelas leis aplicáveis à jurisdição do usuário. Em caso de conflito entre esta política e os Termos de Serviço, prevalecerão os termos mais protetivos à privacidade do usuário.</p>
        </section>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSeo } from '@/composables/useSeo'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// SEO dinâmico baseado no locale
useSeo({
  title: t('footer.legal.privacy'),
  description: 'Política de Privacidade do WatchNext. Saiba como coletamos, usamos e protegemos seus dados pessoais.',
  canonical: 'https://watchnext.app/privacy-policy',
  ogImage: 'https://watchnext.app/assets/images/hero.svg',
  twitterCard: 'summary_large_image',
})
</script>

<style scoped lang="scss">
@use '@/style/variables' as *;

.legal-page {
  min-height: 100vh;
  padding-top: 80px;
  background-color: $color-background;
}

.legal-back {
  margin-bottom: $space-8;

  &-link {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
    font-size: $text-sm;
    font-weight: $weight-medium;
    color: $color-text-secondary;
    text-decoration: none;
    padding: $space-2 $space-3;
    border-radius: $radius-md;
    transition: all $transition-fast;

    &:hover {
      color: $brand-highlight;
      background-color: $color-surface;
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
}

.legal-content {
  max-width: 800px;
  margin: 0 auto;
  padding: $space-12 $space-4;
}

.legal-header {
  margin-bottom: $space-12;
  text-align: center;
}

.legal-title {
  font-size: $text-4xl;
  font-weight: $weight-bold;
  color: $color-text;
  margin-bottom: $space-4;
}

.legal-subtitle {
  font-size: $text-sm;
  color: $color-text-muted;
}

.legal-section {
  margin-bottom: $space-10;

  h2 {
    font-size: $text-2xl;
    font-weight: $weight-semibold;
    color: $color-text;
    margin-bottom: $space-4;
    padding-bottom: $space-2;
    border-bottom: 2px solid $color-primary;
  }

  h3 {
    font-size: $text-lg;
    font-weight: $weight-medium;
    color: $color-text-secondary;
    margin: $space-6 0 $space-3;
  }

  p {
    font-size: $text-base;
    line-height: $leading-relaxed;
    color: $color-text-secondary;
    margin-bottom: $space-4;

    a {
      color: $brand-highlight;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  ul {
    list-style: none;
    padding-left: 0;
    margin-bottom: $space-4;

    li {
      font-size: $text-base;
      line-height: $leading-relaxed;
      color: $color-text-secondary;
      padding-left: $space-4;
      margin-bottom: $space-3;
      position: relative;

      &::before {
        content: '•';
        color: $brand-highlight;
        font-weight: $weight-bold;
        position: absolute;
        left: 0;
      }

      strong {
        color: $color-text;
        font-weight: $weight-semibold;
      }
    }
  }
}

@media (max-width: 639px) {
  .legal-page {
    padding-top: 64px;
  }

  .legal-content {
    padding: $space-6 $space-4;
  }

  .legal-title {
    font-size: $text-2xl;
  }

  .legal-section {
    h2 {
      font-size: $text-xl;
    }

    h3 {
      font-size: $text-base;
    }

    p, ul li {
      font-size: $text-sm;
    }
  }
}
</style>