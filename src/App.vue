<template>
  <div id="app">
    <Header />
    <main>
      <HeroSection />
      <FeaturesSection />
      <PlatformsSection />
      <PremiumSection />
      <RoadmapSection />
      <NewsletterSection />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Footer from '@/components/layout/Footer.vue'
import HeroSection from '@/sections/HeroSection.vue'
import FeaturesSection from '@/sections/FeaturesSection.vue'
import PlatformsSection from '@/sections/PlatformsSection.vue'
import PremiumSection from '@/sections/PremiumSection.vue'
import RoadmapSection from '@/sections/RoadmapSection.vue'
import NewsletterSection from '@/sections/NewsletterSection.vue'
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>