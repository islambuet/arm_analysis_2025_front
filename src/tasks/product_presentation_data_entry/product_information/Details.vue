<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header">
      <div>{{labels.get('label_details_task')}} ({{item.id}})</div>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-md-2">
          <div class="row">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_part_name')}}</label>
            </div>
            <div class="col-8">
              {{item.data.part_name}}
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="row">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_area_name')}}</label>
            </div>
            <div class="col-8">
              {{item.data.area_name}}
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="row">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_territory_name')}}</label>
            </div>
            <div class="col-8">
              {{item.data.territory_name}}
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="row">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_upazila_id')}}</label>
            </div>
            <div class="col-8">
              {{item.data.upazila_name}}-{{item.data.district_name}}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>


  import toastFunctions from "@/assets/toastFunctions";
  import labels from '@/labels'
  
  import {useRouter} from "vue-router";
  import {inject, reactive} from "vue";
  import axios from "axios";
  import DetailTemplate from '@/components/DetailTemplate.vue';
  import {useRoute} from "vue-router/dist/vue-router";
  import systemFunctions from "@/assets/systemFunctions";


  const route =useRoute()
  const router =useRouter()
  let taskData = inject('taskData')
  let item=reactive({
    id:0,
    exists:false,
    detailFields:{},
    data:{
    }
  })
  const setDetailFields=async ()=>{
    item.detailFields= {};
    await systemFunctions.delay(1);
    let detailFields={}
    let key='id';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'hidden',
      values:[item.data[key]],
    };
    key='name';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='code';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='replica';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='status';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='ordering';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'number',
      values:[item.data[key]],
    };
    key='created_at';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'date-time',
      values:[item.data[key]],
    };
    item.detailFields=detailFields;
  }
  const getItem=async ()=>{
    await axios.get(taskData.api_url+'/get-item/'+ item.id).then((res)=>{
      if (res.data.error == "") {
        item.data=res.data.item;
        item.exists=true;
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
  }
  item.id=route.params['item_id'];
  getItem();

</script>