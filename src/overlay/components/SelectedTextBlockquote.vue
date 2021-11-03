<template>
  <blockquote class="blockquote noteforce-blockquote">{{ text }}</blockquote>
</template>

<script>
export default {
  name: 'SelectedTextBlockquote',
  props: ['text'],
};
</script>

<style lang="scss">
$yellow: #f8bb04;
.noteforce blockquote.noteforce-blockquote.blockquote {
  position: relative;
  padding-left: 1em;
  border: none;
  border-left: 0.2em solid $yellow;
  font-size: 0.9rem !important;
  font-style: italic;
  color: gray;
  background-color: transparent;

  &:before,
  &:after {
    content: '\201C';
    color: $yellow;
  }

  &:after {
    content: '\201D';
  }
  &.noteforce-007bff {
    border-left: 0.2em solid #007bff;
    &:before,
    &:after {
      color: #007bff;
    }
  }
  &.noteforce-28a745 {
    border-left: 0.2em solid #28a745;
    &:before,
    &:after {
      color: #28a745;
    }
  }
  &.noteforce-ff4500 {
    border-left: 0.2em solid #ff4500;
    &:before,
    &:after {
      color: #ff4500;
    }
  }
  &.noteforce-fc88ab {
    border-left: 0.2em solid #fc88ab;
    &:before,
    &:after {
      color: #fc88ab;
    }
  }
  &.noteforce-8a54ce {
    border-left: 0.2em solid #8a54ce;
    &:before,
    &:after {
      color: #8a54ce;
    }
  }
}
</style>
