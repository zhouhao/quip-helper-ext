<template>
  <div class="container">
    <div class="py-3 text-center">
      <h2>OneTab Dashboard ({{ allTabs.length }})</h2>
    </div>

    <div class="py-1 text-center">
      <div>
        <button type="button" class="btn btn-link clean-all" @click="cleanAll">Clean All</button> |
        <button type="button" class="btn btn-link open-all" @click="openAll">Open All</button> |
        <input type="file" id="noteforce-invisible-file-input" style="display: none" />
        <button type="button" class="btn btn-link open-all" @click="importJson">Import</button> |
        <button type="button" class="btn btn-link open-all" @click="exportJson">Export</button>
      </div>
    </div>

    <div class="row">
      <template v-if="allTabs.length > 0">
        <table class="table" style="width:100%">
          <tbody></tbody>
          <tr v-for="tab in allTabs" :key="tab.id">
            <td class="delete"><button type="button" class="btn btn-link" @click="deleteTab(tab.id)">X</button></td>
            <td><img :src="'https://s2.googleusercontent.com/s2/favicons?sz=16&domain=' + getHost(tab.url)" alt="" /></td>
            <td>
              {{ tsFormat(tab.ts) }}
            </td>
            <td>
              <button type="button" class="btn btn-link" @click="open(tab)">{{ tab.title }}</button>
            </td>
          </tr>
        </table>
      </template>
      <template v-else>
        <div class="card">
          <img class="card-img-top onetab-dog-img" :src="image" alt="Card image cap" />
          <div class="card-body text-center">
            <h5 class="card-title">You do not have any saved tabs.</h5>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { getUrlHost } from '../utils/urls';
import { formatDate } from '../utils/base';
import 'bootstrap/dist/css/bootstrap.min.css';
import { saveAs } from 'file-saver';
import { nanoid } from 'nanoid';

export default {
  name: 'OneTab',

  data() {
    return {
      allTabs: [],
      image: chrome.runtime.getURL('icons/dog-2.jpg'),
    };
  },
  mounted() {
    this.loadTabs();
    document.getElementById('noteforce-invisible-file-input').addEventListener('change', event => {
      const input = event.target;
      if ('files' in input && input.files.length > 0) {
        const file = input.files[0];
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = event => resolve(event.target.result);
          reader.onerror = error => reject(error);
          reader.readAsText(file);
        })
          .then(content => {
            const loadedTabs = JSON.parse(content);
            loadedTabs.forEach(tab => (tab.id = nanoid()));
            chrome.storage.local.get(['tabs'], preTabs => {
              let result = [];
              if (preTabs && preTabs.tabs && preTabs.tabs.length > 0) {
                result = [...preTabs.tabs];
              }
              result = [...result, ...loadedTabs];
              chrome.storage.local.set({ tabs: result }, () => {
                console.log('There are ' + result.length + ' tabs now.');
                location.reload();
              });
            });
          })
          .catch(error => console.log(error));
      }
    });
  },
  methods: {
    loadTabs() {
      chrome.storage.local.get(['tabs'], result => {
        this.allTabs = result.tabs || [];
      });
    },
    deleteTab(id) {
      this.allTabs = this.allTabs.filter(tab => tab.id !== id);
      chrome.storage.local.set({ tabs: this.allTabs }, () => {
        console.log('There are ' + this.allTabs.length + ' tabs now.');
      });
    },
    getHost(url) {
      return getUrlHost(url);
    },
    tsFormat(ts) {
      return formatDate(ts);
    },
    open(tab) {
      window.open(tab.url);
      this.deleteTab(tab.id);
    },
    cleanAllSilently() {
      chrome.storage.local.remove('tabs', () => {
        this.loadTabs();
      });
    },
    cleanAll() {
      if (confirm('Are you sure to clean them all?')) {
        this.cleanAllSilently();
      }
    },
    openAll() {
      this.allTabs.forEach(tab => chrome.tabs.create({ url: tab.url, active: false }));
      this.cleanAllSilently();
    },
    exportJson() {
      const blob = new Blob([JSON.stringify(this.allTabs)], { type: 'application/json;charset=utf-8' });
      saveAs(blob, 'oneTab-export.json');
    },
    importJson() {
      document.getElementById('noteforce-invisible-file-input').click();
    },
  },
};
</script>

<style scoped>
.container table td,
.container table td button {
  border: none;
  padding: 0.1rem;
  font-family: 'Open Sans', 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
}

.delete a {
  color: black;
}

.clean-all {
  color: red;
}

.card {
  width: 602px;
  margin-left: auto;
  margin-right: auto;
}
</style>
