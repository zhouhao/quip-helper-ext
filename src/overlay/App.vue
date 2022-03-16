<template>
  <div class="quip-helper">
    <InlineEditorMenu v-if="showInlineEditor" />

    <div class="form-group width-range-input" id="doc-width-container" ref="extContainer">
      <label for="doc-width-input" @mousedown="drag" style="cursor: move;">Adjust Article Width:</label>
      <input type="range" class="form-control-range" id="doc-width-input" v-model="docWidth" :min="minW" :max="maxW" />
    </div>
  </div>
</template>

<script>
import InlineEditorMenu from './components/InlineEditorMenu';
import $ from 'jquery';

export default {
  name: 'App',
  components: { InlineEditorMenu },
  data() {
    return {
      showInlineEditor: false,
      docWidth: 100,
      minW: 1000,
      maxW: 1600,
      positions: {
        clientX: undefined,
        clientY: undefined,
        movementX: 0,
        movementY: 0,
      },
    };
  },
  watch: {
    docWidth: function(val, oldVal) {
      $('.parts-screen-children-wrapper').css('max-width', val + 'px');
    },
  },
  created() {
    this.showInlineEditor = !!document.querySelector('article');
    this.docWidth = parseInt($('.parts-screen-children-wrapper').css('max-width'));
    this.minW = this.docWidth;
    this.maxW = window.innerWidth;
  },
  methods: {
    drag(event) {
      event.preventDefault();
      // get the mouse cursor position at startup:
      this.positions.clientX = event.clientX;
      this.positions.clientY = event.clientY;
      document.onmousemove = this.elementDrag;
      document.onmouseup = this.closeDragElement;
    },
    elementDrag(event) {
      event.preventDefault();
      this.positions.movementX = this.positions.clientX - event.clientX;
      this.positions.movementY = this.positions.clientY - event.clientY;
      this.positions.clientX = event.clientX;
      this.positions.clientY = event.clientY;
      // set the element's new position:
      this.$refs.extContainer.style.top = this.$refs.extContainer.offsetTop - this.positions.movementY + 'px';
      this.$refs.extContainer.style.left = this.$refs.extContainer.offsetLeft - this.positions.movementX + 'px';
    },
    closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    },
  },
};
</script>

<style lang="scss">
$zIndex: 9999;
.quip-helper {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;

  z-index: $zIndex;

  #doc-width-container {
    position: fixed;
    width: 150px;
    height: 60px;
    right: 50px;
    bottom: 30px;
    background-color: rgba(255, 255, 255, 0.8);
    opacity: 0.3;
    &:hover {
      opacity: 1;
    }
  }
}
</style>
