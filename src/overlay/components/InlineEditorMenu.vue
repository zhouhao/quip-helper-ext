<template>
  <div id="editorTray" class="nav-toolbar-ribbon-button-group button-group">
    <div id="inline-editor-menu-container" class="button-group-buttons"></div>
  </div>
</template>

<script>
import $ from 'jquery';

const itemList = ['Bold', 'Italic', 'Underline', 'Strikethrough', 'Text Color', 'Highlight', 'Code', 'Link', 'Comment'];
export default {
  name: 'InlineEditorMenu',
  data() {
    return {
      user: '',
    };
  },
  mounted() {
    document.querySelector('article').addEventListener('mouseup', () => {
      const tray = document.getElementById('editorTray');

      if (window.getSelection().toString()) {
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
  },

  methods: {
    buildMenu() {
      const container = $('#inline-editor-menu-container');
      container.empty();
      itemList.forEach(it => {
        const item = document.querySelector(`[aria-label="${it}"]`);
        const clonedItem = item.cloneNode(true);
        clonedItem.removeAttribute('aria-label');
        clonedItem.setAttribute('data-origin', it);
        clonedItem.classList.add('noteforce-editor-btn');
        container.append(clonedItem);
      });
      $(document).on('click', '.noteforce-editor-btn', function(event) {
        event.preventDefault();
        const origin = $(this).data('origin');
        console.log('origin = ', origin);
        if (origin) {
          document.querySelector(`[aria-label="${origin}"]`).click();
        }
        document.getElementById('editorTray').classList.remove('visible');
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
