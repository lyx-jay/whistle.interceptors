<script lang="ts">
  import RuleList from '@/lib/RuleList.svelte';
  import RuleDetail from '@/lib/RuleDetail.svelte';

</script>

<div class="rules-container">
  <div class="rules-content">
    <div class="rules-list">
      <RuleList />
    </div>
    <div class="rules-detail">
      <RuleDetail />
    </div>
  </div>
</div>

<style>
  .rules-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background-color: #1a1a1a;
    color: #ffffff;
  }

  .rules-content {
    display: flex;
    flex: 1;
    width: 100%;
    overflow: hidden;
  }

  .rules-list {
    width: 200px;
    border-right: 1px solid #333;
  }

  .rules-detail {
    flex: 1;
  }

  @media (max-width: 768px) {
    .rules-content {
      flex-direction: column;
    }

    .rules-list {
      width: 100%;
      height: 50%;
      border-right: none;
      border-bottom: 1px solid #333;
    }

    .rules-detail {
      height: 50%;
    }
  }
</style>