<template>
  <div id="parameter-transforms" class="parameter-transforms">
    <div>
      Active:
      <div class="active"></div>
      <br />
      <input
        type="button"
        value="Clear all active transforms"
        id="clear-all-active-parameter-transforms-button"
      />
    </div>
    <div>
      Available:
      <div class="available"></div>
    </div>
    <div>
      Id:<br />
      <input type="text" id="parameter-transform-id" /><br />
      Script:<br />
      <textarea id="parameter-transform-script" rows="5" cols="10"></textarea
      ><br />
      <input type="button" id="add-parameter-transform" value="Add/Modify" />
      <input type="button" id="delete-parameter-transform" value="Delete" />
    </div>
  </div>
</template>

<style lang="scss">
.parameter-transforms {
  display: flex;
  gap: 2em;

  & *:nth-child(1),
  & *:nth-child(2) {
    flex-grow: 0;
  }

  & *:last-child {
    flex-grow: 3;

    & input[type='text'],
    & textarea {
      width: 100%;
    }
  }

  & .active,
  & .available {
    overflow: scroll;
    max-height: 900px;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
      display: none;
    }

    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    min-width: 100px;
    max-width: 200px;
    min-height: 20px;
    border: solid 1px;

    & > div {
      border: solid 1px;
      margin: -1px;
      padding: 0.2ex;
    }
  }
}
</style>
