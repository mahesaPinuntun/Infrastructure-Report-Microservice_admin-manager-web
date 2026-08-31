<template>
  <div class="not-found-container">
    <h1>404</h1>
    <p>Halaman yang Anda cari tidak ditemukan.</p>
    <router-link to="/dashboard" class="btn-home">Kembali ke Dashboard</router-link>
  </div>
</template>

<style scoped>
.not-found-container { text-align: center; margin-top: 80px; }
.btn-home { color: #2563eb; text-decoration: underline; }
</style>
