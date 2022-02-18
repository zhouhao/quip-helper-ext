<template>
  <div class="quip-helper">
    <InlineEditorMenu v-if="quip.showInlineEditor" />

    <div class="form-group width-range-input" id="doc-width-container" v-if="quip.showInlineEditor && quip.zenMode">
      <label for="doc-width-input">Change Doc Width:</label>
      <input type="range" class="form-control-range" id="doc-width-input" v-model="quipDocWidth" />
    </div>
  </div>
</template>

<script>
import * as types from '../utils/action-types';
import InlineEditorMenu from './components/InlineEditorMenu';
import $ from 'jquery';

export default {
  name: 'App',
  components: { InlineEditorMenu },
  data() {
    return {
      quip: {
        showInlineEditor: false,
        zenMode: false,
        docMaxWidth: '',
      },
      quipDocWidth: 100,
    };
  },
  watch: {
    quipDocWidth: function(val, oldVal) {
      $('.parts-screen-children-wrapper').css('width', val + '%');
    },
  },
  created() {
    this.quip.showInlineEditor = !!document.querySelector('article');
    this.quip.docMaxWidth = $('.parts-screen-children-wrapper').css('max-width');
  },
  mounted() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === types.CMD_QUIP_ZEN_MODE) {
        if (!this.quip.showInlineEditor) {
          return;
        }
        this.toggleZenMode(this.quip.zenMode);
      }
      sendResponse({ done: true });
      return true;
    });
  },
  methods: {
    toggleZenMode(zenModeStatus) {
      this.quip.zenMode = !zenModeStatus;
      const sidebar = $('div.navigation-controller-sidebar');
      const navbar = $('div.navigation-controller-header.has-toolbar');
      const quipDoc = $('div.editor.document');
      const docContainer = $('.parts-screen-children-wrapper');
      if (this.quip.zenMode) {
        sidebar.addClass('quip-helper-zen-mode');
        navbar.addClass('quip-helper-zen-mode');
        quipDoc.addClass('quip-helper-fullscreen');
        this.quip.docMaxWidth = docContainer.css('max-width');
        docContainer.css('max-width', '');
        docContainer.css('width', this.quipDocWidth + '%');
      } else {
        sidebar.removeClass('quip-helper-zen-mode');
        navbar.removeClass('quip-helper-zen-mode');
        quipDoc.removeClass('quip-helper-fullscreen');
        docContainer.css('max-width', this.quip.docMaxWidth);
        docContainer.css('width', '');
      }
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
    right: 50px;
    bottom: 50px;
    opacity: 0.5;
    &:hover {
      opacity: 1;
    }
  }
}

.quip-helper-zen-mode {
  position: fixed !important;
  left: -1000px !important;
  top: -1000px !important;
}
.quip-helper-fullscreen {
  position: fixed !important;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 99999;
}
</style>
