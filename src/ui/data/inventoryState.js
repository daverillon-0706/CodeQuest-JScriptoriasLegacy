import inventoryData
  from "./inventoryData.js";

const inventoryState = {

  key: {},
  cons: {}

};

// Initialize keys → false
Object.keys(
  inventoryData.key
).forEach(id => {

  inventoryState.key[id] = false;

});

// Initialize consumables → 0
Object.keys(
  inventoryData.cons
).forEach(id => {

  inventoryState.cons[id] = 0;

});

export default inventoryState;
