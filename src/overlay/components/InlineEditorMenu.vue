<template>
  <div id="editorTray" class="nav-toolbar-ribbon-button-group button-group">
    <div id="inline-editor-menu-container" class="button-group-buttons"></div>
  </div>
</template>

<script>
import $ from 'jquery';

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

    $(document).on('click', '.quip-helper-editor-btn', function(event) {
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
      container.find('.quip-helper-editor-btn').remove();
      itemList.forEach(it => {
        const item = document.querySelector(`[aria-label="${it}"]`);
        if (!item) {
          return;
        }
        const clonedItem = item.cloneNode(true);
        clonedItem.removeAttribute('aria-label');
        clonedItem.setAttribute('data-origin', it);
        clonedItem.classList.add('quip-helper-editor-btn');
        container.append(clonedItem);
      });
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
