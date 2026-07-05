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
          <h1 class="legal-title">Termos de Serviço</h1>
          <p class="legal-subtitle">Última atualização: 5 de julho de 2026</p>
        </header>

        <section class="legal-section">
          <h2>1. Aceitação dos Termos</h2>
          <p>Bem-vindo ao WatchNext. Ao acessar ou utilizar nossa plataforma, você concorda em ficar vinculado a estes Termos de Serviço ("Termos") e a todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, não utilize nossos serviços.</p>
          <p>Reservamo-nos o direito de modificar estes Termos a qualquer momento. As alterações entrarão em vigor imediatamente após sua publicação na plataforma. O uso continuado do WatchNext após alterações constitui aceitação dos novos termos.</p>
        </section>

        <section class="legal-section">
          <h2>2. Descrição do Serviço</h2>
          <p>O WatchNext é uma plataforma de acompanhamento e descoberta de conteúdo de streaming que permite aos usuários:</p>
          <ul>
            <li><strong>Descobrir:</strong> encontrar filmes e séries através de recomendações personalizadas.</li>
            <li><strong>Acompanhar:</strong> manter listas de conteúdo assistido e a assistir em múltiplos serviços de streaming.</li>
            <li><strong>Compartilhar:</strong> criar e compartilhar listas com outros usuários.</li>
            <li><strong>Organizar:</strong> utilizar calendário de lançamentos e alertas para novas temporadas.</li>
          </ul>
          <p>O WatchNext não hospeda, transmite ou distribui conteúdo de vídeo. Somos um serviço complementar que ajuda usuários a organizar e descobrir conteúdo disponível em plataformas de streaming de terceiros.</p>
        </section>

        <section class="legal-section">
          <h2>3. Conta de Usuário</h2>

          <h3>3.1 Elegibilidade</h3>
          <p>Para criar uma conta, você deve ter pelo menos 13 anos de idade. Ao criar uma conta, você declara e garante que atende a este requisito de idade.</p>

          <h3>3.2 Informações de Cadastro</h3>
          <p>Você concorda em fornecer informações precisas, atuais e completas durante o processo de cadastro e a manter essas informações atualizadas.</p>

          <h3>3.3 Segurança da Conta</h3>
          <ul>
            <li>Você é responsável por manter a confidencialidade de suas credenciais de login.</li>
            <li>Você é responsável por todas as atividades que ocorrem em sua conta.</li>
            <li>Deve nos notificar imediatamente sobre qualquer uso não autorizado de sua conta.</li>
            <li>Não compartilhe sua senha com terceiros.</li>
          </ul>

          <h3>3.4 Encerramento de Conta</h3>
          <p>Você pode encerrar sua conta a qualquer tempo através das configurações de perfil. Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos, sem aviso prévio.</p>
        </section>

        <section class="legal-section">
          <h2>4. Conduta do Usuário</h2>
          <p>Ao utilizar o WatchNext, você concorda em NÃO:</p>
          <ul>
            <li>Utilizar a plataforma para atividades ilegais ou não autorizadas.</li>
            <li>Violar direitos de propriedade intelectual de terceiros.</li>
            <li>Transmitir conteúdo malicioso, vírus ou códigos destrutivos.</li>
            <li>Tentar acessar sistemas, redes ou dados sem autorização.</li>
            <li>Assediar, ameaçar ou prejudicar outros usuários.</li>
            <li>Postar conteúdo falso, enganoso ou difamatório.</li>
            <li>Utilizar bots, raspadores ou métodos automatizados para acessar a plataforma.</li>
            <li>Contornar medidas de segurança ou autenticação.</li>
            <li>Fazer engenharia reversa, descompilar ou tentar acessar o código-fonte.</li>
            <li>Vender, alugar ou licenciar acesso à plataforma sem autorização.</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>5. Propriedade Intelectual</h2>

          <h3>5.1 Nossa Propriedade</h3>
          <p>O WatchNext e seus originais, incluindo código, design, logotipos, marcas registradas e conteúdo, são de nossa propriedade ou de nossos licenciadores e estão protegidos por leis de propriedade intelectual aplicáveis.</p>

          <h3>5.2 Conteúdo de Terceiros</h3>
          <p>Informações sobre filmes e séries são obtidas de fontes de terceiros (como TMDb, IMDb). Essas informações são utilizadas sob licenças apropriadas e permanecem propriedade de seus respectivos detentores.</p>

          <h3>5.3 Conteúdo do Usuário</h3>
          <p>Ao criar listas, resenhas ou outros conteúdos na plataforma, você mantém a propriedade, mas nos concede licença não exclusiva, mundial e gratuita para usar, exibir e distribuir esse conteúdo no âmbito da plataforma.</p>
        </section>

        <section class="legal-section">
          <h2>6. Assinaturas e Pagamentos</h2>

          <h3>6.1 Planos Disponíveis</h3>
          <p>O WatchNext oferece planos gratuitos e premium. Recursos premium incluem experiência sem anúncios, análises avançadas, suporte prioritário e acesso antecipado a novos recursos.</p>

          <h3>6.2 Faturamento</h3>
          <ul>
            <li>Assinaturas premium são renovadas automaticamente no início de cada ciclo.</li>
            <li>Os preços podem variar por região e estão sujeitos a alterações.</li>
            <li>Alterações de preço serão comunicadas com antecedência mínima de 30 dias.</li>
            <li>Pagamentos são processados através de provedores terceiros seguros.</li>
          </ul>

          <h3>6.3 Cancelamento e Reembolso</h3>
          <ul>
            <li>Você pode cancelar sua assinatura premium a qualquer momento.</li>
            <li>O cancelamento será efetivo no final do período de faturamento atual.</li>
            <li>Não oferecemos reembolsos parciais por períodos não utilizados.</li>
            <li>Após o cancelamento, você mantém acesso aos recursos premium até o fim do período pago.</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>7. Privacidade</h2>
          <p>Sua privacidade é importante para nós. O tratamento de dados pessoais é regido por nossa Política de Privacidade, que pode ser acessada separadamente. Ao usar o WatchNext, você concorda com a coleta e uso de informações conforme descrito na Política de Privacidade.</p>
        </section>

        <section class="legal-section">
          <h2>8. Links para Sites de Terceiros</h2>
          <p>A plataforma pode conter links para serviços de streaming de terceiros (Netflix, Prime Video, Disney+, etc.). Não controlamos, endossamos ou assumimos responsabilidade por conteúdos, políticas ou práticas de sites de terceiros. Acesse-os por sua própria conta e risco.</p>
        </section>

        <section class="legal-section">
          <h2>9. Isenções e Limitações de Responsabilidade</h2>

          <h3>9.1 Serviços "Como Estão"</h3>
          <p>O WatchNext é fornecido "como está" e "conforme disponível", sem garantias de qualquer tipo, expressas ou implícitas, incluindo garantias de comercialização, adequação a um propósito específico e não violação.</p>

          <h3>9.2 Limitação de Responsabilidade</h3>
          <p>Em nenhuma circunstância seremos responsáveis por danos indiretos, incidentais, especiais ou consequenciais, incluindo perda de lucros, dados ou uso, mesmo que tenhamos sido avisados da possibilidade de tais danos.</p>

          <h3>9.3 Disponibilidade do Serviço</h3>
          <p>Não garantimos que a plataforma será ininterrupta, segura ou livre de erros. Reservamo-nos o direito de modificar, suspender ou descontinuar qualquer aspecto do serviço a qualquer momento.</p>
        </section>

        <section class="legal-section">
          <h2>10. Indenização</h2>
          <p>Você concorda em indenizar, defender e isentar o WatchNext e seus diretores, funcionários e parceiros de quaisquer reclamações, perdas, responsabilidades, despesas ou custos (incluindo honorários advocatícios) decorrentes de seu uso da plataforma, violação destes Termos ou violação de direitos de terceiros.</p>
        </section>

        <section class="legal-section">
          <h2>11. Rescisão</h2>
          <p>Podemos suspender ou encerrar seu acesso ao WatchNext imediatamente, sem aviso prévio, por conduta que acreditamos violar estes Termos, ser prejudicial a outros usuários ou terceiros, ou seja ilegal. Após a rescisão, seu direito de usar a plataforma cessará imediatamente.</p>
        </section>

        <section class="legal-section">
          <h2>12. Lei Aplicável e Foro</h2>
          <p>Estes Termos são regidos pelas leis aplicáveis à jurisdição do usuário. Quaisquer disputas relacionadas a estes Termos ou ao serviço serão resolvidas nos tribunais competentes da jurisdição do usuário, exceto quando a lei aplicável determinar otherwise.</p>
        </section>

        <section class="legal-section">
          <h2>13. Disposições Diversas</h2>
          <ul>
            <li><strong>Integralidade:</strong> Estes Termos constituem o acordo completo entre você e o WatchNext.</li>
            <li><strong>Renúncia:</strong> A falha em aplicar qualquer direito ou disposição destes Termos não constitui renúncia.</li>
            <li><strong>Divisibilidade:</strong> Se alguma disposição for considerada inválida, as demais permanecem em pleno vigor.</li>
            <li><strong>Cessão:</strong> Você não pode ceder seus direitos sob estes Termos sem nosso consentimento prévio.</li>
            <li><strong>Títulos:</strong> Os títulos das seções são apenas para conveniência e não afetam a interpretação.</li>
          </ul>
        </section>

        <section class="legal-section">
          <h2>14. Informações de Contato</h2>
          <p>Para perguntas sobre estes Termos de Serviço, entre em contato conosco:</p>
          <ul>
            <li><strong>E-mail:</strong> <a href="mailto:legal@watchnext.app">legal@watchnext.app</a></li>
            <li><strong>Endereço:</strong> WatchNext Legal Team</li>
          </ul>
        </section>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSeo } from '@/composables/useSeo'
import { useI18n } from 'vue-i18n'
import { analytics } from '@/services/analytics'
import { trackPageView, trackFooterLink } from '@/services/analytics/helpers'

const { t } = useI18n()

// SEO
useSeo({
  title: t('footer.legal.terms'),
  description: 'Termos de Serviço do WatchNext. Regras e condições para uso da plataforma de descoberta e acompanhamento de conteúdo.',
  canonical: 'https://watchnext.app/terms-of-service',
  ogImage: 'https://watchnext.app/assets/images/hero.svg',
  twitterCard: 'summary_large_image',
})

// Track page view
onMounted(() => {
  analytics.trackEvent(trackPageView())
  analytics.trackEvent(trackFooterLink('Terms of Service', '/terms-of-service'))
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