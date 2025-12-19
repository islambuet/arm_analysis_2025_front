<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header d-print-none">
      {{labels.get('label_task')}}( {{item.name}} )
    </div>
    <div class="card-body" style='overflow-x:auto;height:600px;padding: 0'>
        <table style="width: 1600px;" class="table table-bordered sticky">
          <thead class="table-active">
          <tr>
            <th style="width: 150px;">{{labels.get('label_crop_name')}}</th>
            <th style="width: 200px;">{{labels.get('label_crop_type_name')}}</th>
            <th style="width: 100px;">Total Market Size</th>
            <th style="width: 200px;">Pocket Market</th>
            <th style="">Compare Variety</th>
          </tr>
          </thead>
          <tbody class="table-striped table-hover">
          <tr class="row_type" v-for="row in item.rows" :key="'row_'+row.id" :id="'type_'+row.id">
            <td class="col_crop_name">{{row.crop_name}}</td>
            <td class="col_crop_type_name">{{row.crop_type_name}}</td>
            <td class="col_market_size_total">{{item.data[row.id]?item.data[row.id]['market_size_total']:''}}</td>
            <td class="col_pocket_market">{{item.data[row.id]?item.data[row.id]['pocket_market']:''}}</td>
            <td class="col_competitors_info">
              <template v-if="item.data[row.id] " v-for="(competitor_varieties_info,competitor_variety_id) in item.data[row.id]['competitor_varieties']">
                <div class="row">
                  <div class="col-12">
                    <div><strong>Company:</strong>{{ (taskData.varieties_competitor_typewise[row.id] && taskData.varieties_competitor_typewise[row.id][competitor_variety_id])?taskData.varieties_competitor_typewise[row.id][competitor_variety_id]['competitor_name']:"Other" }}  </div>
                    <div><strong>Variety: </strong>{{ (taskData.varieties_competitor_typewise[row.id] && taskData.varieties_competitor_typewise[row.id][competitor_variety_id])?taskData.varieties_competitor_typewise[row.id][competitor_variety_id]['name']:"Other" }}</div>
                    <div><strong>Why Recommended: </strong>{{item.data[row.id]['competitor_varieties'][competitor_variety_id]?item.data[row.id]['competitor_varieties'][competitor_variety_id]['recommended_reason']:''}}</div>
                    <table class="table table-bordered">
                      <thead>
                      <tr>
                        <th style="width: 150px">Variety</th>
                        <th>Why Suggested</th>
                        <th style="width: 100px">Apporx Qtn</th>
                        <th style="width: 100px"># Demo</th>
                        <th style="width: 100px"># Farmer Meeting</th>
                        <th style="width: 100px"># Dealer Meeting</th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-if="item.data[row.id]['arm_varieties'] && item.data[row.id]['arm_varieties'][competitor_variety_id]" v-for="(arm_varieties_info,arm_variety_id) in item.data[row.id]['arm_varieties'][competitor_variety_id]">
                        <td>{{ (taskData.varieties_arm_typewise[row.id] && taskData.varieties_arm_typewise[row.id][arm_variety_id])?taskData.varieties_arm_typewise[row.id][arm_variety_id]['name']:"Other" }}</td>
                        <td>{{ arm_varieties_info['suggested_reason'] }}</td>
                        <td>{{ arm_varieties_info['quantity_sales'] }}</td>
                        <td>{{ arm_varieties_info['num_demo'] }}</td>
                        <td>{{ arm_varieties_info['num_farmer_meeting'] }}</td>
                        <td>{{ arm_varieties_info['num_dealer_meeting'] }}</td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </template>
            </td>
          </tr>
          </tbody>
        </table>

    </div>
  </div>
</template>
<script setup>

import globalVariables from "@/assets/globalVariables";
import systemFunctions from "@/assets/systemFunctions";
import toastFunctions from "@/assets/toastFunctions";
import labels from '@/labels'

import {useRouter} from "vue-router";
import {inject, reactive} from "vue";
import axios from "axios";
import InputTemplate from '@/components/InputTemplate.vue';
import {useRoute} from "vue-router/dist/vue-router";


const route =useRoute()
const router =useRouter()
let taskData = inject('taskData')
let item=reactive({
  id:'',
  name:'',
  exists:false,
  data:{},
  rows:[]
})
const getItem=async ()=>{
  await axios.get(taskData.api_url+'/get-item/'+ item.id).then((res)=>{
    if (res.data.error == "") {
      item.data=res.data.data;
      let rows=[];
      for(let i=0;i<taskData.crop_types.length;i++){
        let crop_type=taskData.crop_types[i];
        let row={};
        row['id']=crop_type['id'];
        row['crop_name']=crop_type['crop_name'];
        row['crop_type_name']=crop_type['name'];
        rows.push(row);
      }
      item.rows=rows;
      item.exists=true;
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
item.id=route.params['item_id']?route.params['item_id']:'';
if(item.id){
  if(!(taskData.permissions.action_2)){
    toastFunctions.showAccessDenyMessage();
  }
  else{
    let name=item.id.substring(0,4)+' -- '
    let season_id=item.id.substring(5,item.id.lastIndexOf('_'));
    for(let i=0;i<taskData.seasons.length;i++){
      if(taskData.seasons[i].id==season_id){
        name+=taskData.seasons[i].name;
      }
    }
    name+=' -- '
    let territory_id=item.id.substring(item.id.lastIndexOf('_')+1);
    for(let i=0;i<taskData.location_territories.length;i++){
      if(taskData.location_territories[i].id==territory_id){
        name+=taskData.location_territories[i].name;
      }
    }
    item.name=name;
    getItem();
  }
}
else{
  toastFunctions.showAccessDenyMessage();
}

</script>