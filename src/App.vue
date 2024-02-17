<template>
  <div class="container">
    <ul class="list">
      <li>
        <router-link class="list-link" to="/"> Home </router-link>
      </li>
      <li>
        <router-link class="list-link" to="/calendar">
          Booking calendar
        </router-link>
      </li>
    </ul>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 30px;
  background: #fff;
}

.list {
  display: flex;
  list-style: none;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
}

.list-link {
  font-size: 22px;
  color: #000;
}
</style>
