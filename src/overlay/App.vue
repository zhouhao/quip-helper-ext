<template>
  <div class="quip-helper">
    <InlineEditorMenu v-if="showInlineEditor" />

    <div class="form-group width-range-input" id="doc-width-container">
      <label for="doc-width-input">Adjust Article Width:</label>
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
    right: 50px;
    bottom: 30px;
    opacity: 0.3;
    &:hover {
      opacity: 1;
    }
  }
}
</style>
