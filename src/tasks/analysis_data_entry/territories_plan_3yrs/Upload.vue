<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="systemFunctions.exportCsv(item.columns_type_info,[],'Upload Format('+labels.get('label_task')+' - Type data).csv')"><i class="feather icon-download"></i> {{labels.get('label_upload_format_csv')}} - Type Data</button>
      <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="systemFunctions.exportCsv(item.columns_variety_info,[],'Upload Format('+labels.get('label_task')+' - Variety forecast).csv')"><i class="feather icon-download"></i> {{labels.get('label_upload_format_csv')}} - Variety forecast</button>
      <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="systemFunctions.exportCsv(item.columns_proposed_variety,[],'Upload Format('+labels.get('label_task')+' - Proposed Variety).csv')"><i class="feather icon-download"></i> {{labels.get('label_upload_format_csv')}} - Proposed Variety</button>
    </div>
  </div>
  <div class="card d-print-none mb-2">
    <div class="card-header d-print-none">
      Upload {{labels.get('label_task')}}
    </div>
    <div class="card-body">
      Contact with admin for upload files
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
  id:0,
  exists:false,
  show_report:false,
  file_name:'',
  columns_type_info:{all:{},hidden:[]},
  columns_variety_info:{all:{},hidden:[]},
  columns_proposed_variety:{all:{},hidden:[]},
  data:[],
  inputItems:{},
  inputFields:{},
})
const setColumns=()=>{
  let columns={}
  let key='territory_id';
  columns[key]={label: labels.get('label_'+key)+' ID'}
  key='type_id';
  columns[key]={label: labels.get('label_'+key)+' ID'}
  key='pocket_market';
  columns[key]={label: 'Pocket Market'}
  key='territory_recommendation';
  columns[key]={label: 'Territory Recommendation'}
  key='manager_recommendation';
  columns[key]={label: 'Manager Recommendation'}
  key='manager_suggestion';
  columns[key]={label: 'Manager Suggestion'}
  item.columns_type_info.all=columns
  columns={}
  key='territory_id';
  columns[key]={label: labels.get('label_'+key)+' ID'}
  key='variety_id';
  columns[key]={label: labels.get('label_'+key)+' ID'}
  for(let key of ['forecast','dealer_meeting','farmer_meeting','num_demo','num_result_sharing','num_field_day']){
    for(let i=0;i<3;i++){
      columns[key+'_'+i]={label: labels.get('label_'+key)+'_'+i}
    }
  }
  item.columns_variety_info.all=columns

  columns={}
  key='territory_id';
  columns[key]={label: labels.get('label_'+key)+' ID'}
  key='variety_id_arm';
  columns[key]={label:'Arm '+ labels.get('label_variety_id')+' ID'}
  key='variety_id_competitor';
  columns[key]={label:'Competitor '+ labels.get('label_variety_id')+' ID'}

  item.columns_proposed_variety.all=columns

}
setColumns();
</script>