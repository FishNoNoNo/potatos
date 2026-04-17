<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import IndexView from "./views/IndexView.vue";
import eventHandler from "./hook/eventHandler";

onMounted(() => {
  eventHandler.init();
});

onUnmounted(() => {
  eventHandler.destroy();
});
</script>

<template>
  <IndexView />
</template>

<style lang="scss">
body {
  margin: 0;
  min-height: 100vh;
  background: transparent;
  color: var(--potatos-text);
  font-family: "Segoe UI Variable", "Space Grotesk", "Segoe UI", sans-serif;
  transition:
    background 300ms ease,
    color 300ms ease;
}
button,
input,
textarea,
select {
  font-family: inherit;
}
</style>
