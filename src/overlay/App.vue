<template>
  <div class="quip-helper">
    <InlineEditorMenu v-if="showInlineEditor" />

    <div class="form-group width-range-input" id="doc-width-container" ref="extContainer">
      <label for="doc-width-input" @mousedown="drag" style="cursor: move;">Adjust Article Width:</label>
      <input type="range" class="form-control-range" id="doc-width-input" v-model="docWidth" :min="minW" :max="maxW" />
    </div>

    <div
      class="quip-helper-scrollbar-container"
      v-show="showScrollbarContainer"
      data-orientation="horizontal"
      :style="{ width: this.scrollable.outerWidth + 'px', left: this.scrollable.toLeft + 'px' }"
    >
      <div :style="{ width: this.scrollable.innerWidth + 'px' }"></div>
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
      scrollable: {
        container: null,
        elementInView: null,
        barController: null,
        length: 0,
        toLeft: 0,
        outerWidth: 0, // d.clientWidth: fixed
        innerWidth: 0, // d.scrollWidth: dynamic
      },
    };
  },
  watch: {
    docWidth: function(val, oldVal) {
      this.handleWidthChange(val);
    },
  },

  computed: {
    showScrollbarContainer() {
      return this.scrollable.elementInView && this.scrollable.outerWidth < this.scrollable.innerWidth;
    },
  },
  created() {
    this.showInlineEditor = !!document.querySelector('article');
    this.docWidth = parseInt($('.parts-screen-children-wrapper').css('max-width'));
    this.minW = this.docWidth;
    this.maxW = window.innerWidth;

    this.refreshScrollbar();
    this.scrollable.container = document.querySelector('div.parts-screen-body.scrollable');
    this.scrollable.container.addEventListener('scroll', this.handleScroll);
  },
  mounted() {
    this.scrollable.barController = document.querySelector('div.quip-helper-scrollbar-container');
    this.scrollable.barController.addEventListener('scroll', this.handleControllerScroll);
  },
  destroyed() {
    this.scrollable.container.removeEventListener('scroll', this.handleScroll);
    this.scrollable.barController.removeEventListener('scroll', this.handleControllerScroll);
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
    refreshScrollbar() {
      const scrollableDivs = document.querySelectorAll('div.section.scrollable');
      if (!scrollableDivs || scrollableDivs.length < 1) {
        return;
      }
      this.scrollable.length = scrollableDivs.length;
      const firstDiv = scrollableDivs[0];
      this.scrollable.toLeft = firstDiv.getBoundingClientRect().left;
      this.scrollable.outerWidth = firstDiv.clientWidth;
      this.scrollable.innerWidth = 0;

      this.scrollable.elementInView = this.findElementCrossView(scrollableDivs);
      if (this.scrollable.elementInView) {
        this.scrollable.innerWidth = this.scrollable.elementInView.scrollWidth;
        // this.scrollable.barController.scrollLeft = this.scrollable.elementInView.scrollLeft;
      }
      // console.info('HZHOU ' + JSON.stringify(this.scrollable));
    },
    findElementCrossView(elements) {
      if (!elements || elements.length < 1) return null;
      return Array.from(elements).find(e => this.isDivCrossViewVertically(e));
    },
    isDivCrossViewVertically(element) {
      const rect = element.getBoundingClientRect();
      const widthHeight = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < widthHeight && rect.bottom > widthHeight;
    },

    handleWidthChange(width) {
      $('.parts-screen-children-wrapper').css('max-width', width + 'px');
      this.refreshScrollbar();
    },

    handleScroll() {
      this.refreshScrollbar();
    },
    handleControllerScroll() {
      // console.info('HZHOU ' + this.scrollable.barController.scrollLeft);
      if (this.scrollable.elementInView) {
        this.scrollable.elementInView.scrollLeft = this.scrollable.barController.scrollLeft;
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

  .quip-helper-scrollbar-container {
    position: fixed;
    overflow-x: scroll;
    bottom: 10px;
    height: 16px;

    div {
      height: 10px;
    }
  }
}
</style>
