import Vuex from "vuex";
import Vue from "vue";
import data from "../../bookings.json";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    bookings: data,
    bookingsEditedData: [],
  },
  mutations: {
    // Mutation to convert and update the bookingsEditedData state
    convertAndSetBookingsEditedData(state) {
      const convertData = (existingData) => {
        const roomsAndReservations = {};
        existingData.forEach((entry) => {
          const roomName = entry.roomDetails.name;
          const roomId = entry.roomDetails.id;
          if (!roomsAndReservations[roomName]) {
            roomsAndReservations[roomName] = {
              roomName: roomName,
              id: roomId,
              reservations: [],
            };
          }
          const startDate = new Date(entry.start);
          const endDate = new Date(entry.end);
          const differenceMs = endDate.getTime() - startDate.getTime();

          const reservation = {
            id: entry.id,
            name: entry.name,
            phone: entry.phone,
            email: entry.email,
            start: entry.start,
            duration: differenceMs / (1000 * 60 * 60 * 24),
            end: entry.end,
          };
          roomsAndReservations[roomName].reservations.push(reservation);
        });
        const result = Object.values(roomsAndReservations);
        return result;
      };
      state.bookingsEditedData = convertData(state.bookings);
    },
  },
});
