<template>
  <div
    v-if="booking"
    class="popup"
    :style="{
      left: popupPosition ? popupPosition.left + 'px' : '0px',
      top: popupPosition ? popupPosition.top - (260 / 2) + 'px' : '0px',
    }"
  >
    <p>{{ booking.name }}</p>
    <p>{{ booking.phone }}</p>
    <p>{{ booking.email }}</p>
    <p>{{ booking.typeOfApartments }}</p>
    <p>Start: {{ booking.start }}</p>
    <p>End: {{ booking.end }}</p>
    <button
      class="popup__btn"
      @click="closePopup()"
    >
      Close
    </button>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "Popup",
  props: {
    bookingId: {
      type: Number,
      required: true,
    },
    popupPosition: {
      type: Object,
      default: null,
    },
  },
  computed: {
    ...mapState(["bookings"]),
    booking() {
      return this.bookings.find((booking) => booking.id === this.bookingId);
    },
  },

  methods: {
    closePopup() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss">

.popup {
  position: absolute;
  z-index: 1;
  width: 210px;
  height: 260px;
  background-color: #fff;
  box-shadow: 11px 19px 25px -6px rgba(0, 0, 0, 0.33);
  border-radius: 20px;
  padding: 20px;

  &__btn {
    width: 100px;
    height: 30px;
    border-radius: 25px;
    border: none;
    background-color: #252569;
    color: #fff;
  }
}


</style>
