<template>
  <div id="editorTray" class="nav-toolbar-ribbon-button-group button-group">
    <div id="inline-editor-menu-container" class="button-group-buttons">
      <button class="button button-flex clickable icon-only" style="height: 28px; padding-left: 8px; padding-right: 8px;" @click="clickAnnotate">
        <div class="button-icon" aria-hidden="true" style="height: 16px;">
          <svg viewBox="0 0 48 48" preserveAspectRatio="xMidYMid" style="display: block;">
            <g transform="translate(0, 0)">
              <path d="M15,33,6.293,30.274a1,1,0,0,0-.255.433l-4,14a1,1,0,0,0,.688,1.236,1.007,1.007,0,0,0,.548,0l14-4a.994.994,0,0,0,.433-.255Z" fill="#fbe5d5"></path>
              <path d="M28.586,7.981,6.293,30.274,17.707,41.688,40,19.4Z" fill="#ff7163"></path>
              <path d="M3.3,40.3l-1.26,4.409a1,1,0,0,0,.688,1.236,1.007,1.007,0,0,0,.548,0l4.409-1.26Z" fill="#4c4c4c"></path>
              <path d="M34.3,13.7,12.01,35.99l5.7,5.7L40,19.4Z" fill="#f74b3b"></path>
              <path d="M44.828,8.91,39.07,3.153a4.093,4.093,0,0,0-5.656,0l-4.63,4.631L40.2,19.2l4.63-4.631a4,4,0,0,0,0-5.657Z" fill="#3d6c7b"></path>
              <rect x="33.294" y="5.618" width="2" height="16.142" transform="translate(0.365 28.258) rotate(-45)" fill="#2a4b55"></rect>
            </g>
          </svg>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import { EventBus } from '../../utils/event-bus';
import * as types from '../../utils/action-types';

const itemList = ['Bold', 'Italic', 'Underline', 'Strikethrough', 'Text Color', 'Highlight', 'Code', 'Link', 'Comment'];
const colorPickerItems = ['Text Color', 'Highlight'];
export default {
  name: 'InlineEditorMenu',
  data() {
    return {
      selectedText: '',
    };
  },
  mounted() {
    document.querySelector('article').addEventListener('mouseup', () => {
      const tray = document.getElementById('editorTray');
      this.selectedText = window.getSelection().toString();
      if (this.selectedText) {
        this.buildMenu();
        const mouseLocation = window
          .getSelection()
          .getRangeAt(0)
          .getBoundingClientRect();
        const top = mouseLocation.top - 32;
        const left = mouseLocation.left;

        tray.style.top = top + 'px';
        tray.style.left = left + 'px';
        tray.classList.add('visible');
      } else {
        setTimeout(function() {
          tray.style.top = 0 + 'px';
          tray.style.left = 0 + 'px';
        }, 100);
        tray.classList.remove('visible');
      }
    });

    $(document).on('click', '.noteforce-editor-btn', function(event) {
      event.preventDefault();
      const origin = $(this).data('origin');
      if (origin) {
        document.querySelector(`[aria-label="${origin}"]`).click();
        if (colorPickerItems.includes(origin)) {
          const colorPickerContainer = $('.color-picker').closest('.popover');
          // console.error(colorPickerContainer.attr('class'));
          const mouseLocation = window
            .getSelection()
            .getRangeAt(0)
            .getBoundingClientRect();
          const top = mouseLocation.top - 32;
          const left = mouseLocation.left + 64;
          // console.error('left = ' + left + ', top = ' + top);
          colorPickerContainer
            .removeAttr('style')
            .css('position', 'fixed')
            .css('left', left + 'px')
            .css('top', top + 'px');
        }
      }
      document.getElementById('editorTray').classList.remove('visible');
    });
  },

  methods: {
    buildMenu() {
      const container = $('#inline-editor-menu-container');
      container.find('.noteforce-editor-btn').remove();
      itemList.forEach(it => {
        const item = document.querySelector(`[aria-label="${it}"]`);
        if (!item) {
          return;
        }
        const clonedItem = item.cloneNode(true);
        clonedItem.removeAttribute('aria-label');
        clonedItem.setAttribute('data-origin', it);
        clonedItem.classList.add('noteforce-editor-btn');
        container.append(clonedItem);
      });
    },

    clickAnnotate() {
      EventBus.$emit(types.EVENT_ANNOTATE_ICON_CLICKED, this.selectedText);
      document.getElementById('editorTray').classList.remove('visible');
    },
  },
};
</script>

<style scoped>
#editorTray {
  position: fixed;
  display: none;
  background-color: white;
  border: 1px solid #e2dada;
  border-radius: 5px;
  box-shadow: rgb(0 0 0 / 18%) 1px 1px 1px 1px;
}
#editorTray.visible {
  display: flex;
}
</style>
