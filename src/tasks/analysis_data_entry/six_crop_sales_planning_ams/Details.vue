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
        <DetailTemplate :detailFields="item.detailFields" />
        <div class="row mb-2">
          <div class="col-4"><label class="font-weight-bold float-right">Varieties</label></div>
          <div class="col-8">
            <template v-for="(compare_data,comp_variety_id) in item.data.compare_variety">
              <div class="row mb-2">
                <div class="col-3">Why Recommended {{varieties_object[comp_variety_id]?varieties_object[comp_variety_id].name:'NF'}}</div>
                <div class="col-9">{{compare_data['reason_competitor_variety']}}</div>
              </div>
              <template v-for="(arm_variety_data,arm_variety_id) in compare_data['arm_varieties']">
                <div class="row mb-2">
                  <div class="col-3">Approx Quantity {{varieties_object[arm_variety_id]?varieties_object[arm_variety_id].name:'NF'}}</div>
                  <div class="col-9">{{arm_variety_data['quantity_arm_variety']}}</div>
                </div>
                <div class="row mb-2">
                  <div class="col-3">Why Suggested {{varieties_object[arm_variety_id]?varieties_object[arm_variety_id].name:'NF'}}</div>
                  <div class="col-9">{{arm_variety_data['reason_arm_variety']}}</div>
                </div>
              </template>
            </template>

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
      varieties:{}
    },
  })
  let crops_object={};
  for(let i in taskData.crops){
    crops_object[taskData.crops[i]['id']]=taskData.crops[i];
  }
  let crop_types_object={};
  for(let i in taskData.crop_types){
    crop_types_object[taskData.crop_types[i]['id']]=taskData.crop_types[i];
  }
  let varieties_object={};
  for(let i in taskData.varieties){
    varieties_object[taskData.varieties[i]['id']]=taskData.varieties[i];
  }
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
    key='fiscal_year';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]+'-'+(+item.data[key]+1)],
    };
    key='season_name';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='part_name';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='area_name';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='territory_name';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='crop_name';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='type_name';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='market_size_total';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'number',
      values:[item.data[key]],
    };
    key='pocket_market';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='dealer_meeting';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'number',
      values:[item.data[key]],
    };
    key='farmer_meeting';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'number',
      values:[item.data[key]],
    };
    key='num_demo';
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
        setDetailFields();
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