<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="systemFunctions.exportCsv(item.columns,[],'Upload Format('+labels.get('label_task')+').csv')"><i class="feather icon-download"></i> {{labels.get('label_upload_format_csv')}}</button>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="saveItems(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2">
    <div class="card-header d-print-none">
      Upload {{labels.get('label_task')}}
    </div>
    <div class="card-body">
      <div class="row mb-2">
        <div class="col-4">
          <label class="font-weight-bold float-right">{{labels.get('label_select_csv_data_file')}} <span class="text-danger">*</span></label>
        </div>
        <div class="col-lg-4 col-8">
          <div class="input-group input-group-sm">
            <div class="input-group-prepend">
              <label class="btn btn-sm bg-gradient-primary" style="cursor: pointer;">
                <input id="file_upload_items" type="file" accept=".csv" class="d-none">
                <i class="bi bi-upload"></i> {{labels.get('label_upload_file')}}
              </label>
            </div>
            <label class="form-control custom-file-name"></label>
            <div class="input-group-append clear_file" @click="resetFile('file_upload_items')">
              <label class="btn btn-sm bg-gradient-info" style="cursor: pointer;">clear</label>
            </div>
          </div>
        </div>
      </div>
      <form id="formSaveItems" v-if="item.show_report">
        <InputTemplate :inputItems="item.inputFields" />
        <input type="hidden" name="file_name" :value="item.file_name">
        <template v-for="(row,key) in item.inputItems">
          <input type="hidden" :name="'items[]'" :value="JSON.stringify(row)">
        </template>
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">File Name</label>
          </div>
          <div class="col-lg-4 col-8">
            <label class="font-weight-bold">{{item.file_name}} </label>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">Total Records</label>
          </div>
          <div class="col-lg-4 col-8">
            <label class="font-weight-bold">{{item.data.length}}</label> <small>(If more than 4000 discuss with admin)</small>
          </div>
        </div>
        <table class="table table-bordered">
          <thead class="table-active">
          <tr>
            <template v-for="(column,key) in item.columns.all">
              <th class="position-relative align-middle"><div class=" text-center " style="width:calc(100% - 33px);margin-left:17px">{{ column.label }}</div></th>
            </template>
          </tr>
          </thead>
          <tbody class="table-striped table-hover">
          <tr v-for="(datum,index) in item.data">
            <template v-for="(column,key) in item.columns.all">
              <td>
                {{ datum[key] }}
              </td>
            </template>
          </tr>
          </tbody>
        </table>
      </form>
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
  columns:{all:{},hidden:['sl_num','status','dealer_name','variety_name']},
  data:[],
  inputItems:{},
  inputFields:{},
})
let dealers_object={};
for(let i in taskData.dealers){
  dealers_object[taskData.dealers[i]['id']]=taskData.dealers[i];
}
let varieties_object={};
for(let i in taskData.varieties){
  varieties_object[taskData.varieties[i]['id']]=taskData.varieties[i];
}
const setInputFields=async ()=>{
  item.inputFields= {};
  await systemFunctions.delay(1);
  let inputFields={}
  let key='save_token';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'hidden',
    default:new Date().getTime(),
    mandatory:true
  };
  key='fiscal_year';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'dropdown',
    options:new Array(globalVariables.current_fiscal_year-globalVariables.starting_year+1).fill().map((temp,index) => {return {value:globalVariables.current_fiscal_year-index,label:(globalVariables.current_fiscal_year-index)+' - '+(globalVariables.current_fiscal_year-index+1)}}),
    default:globalVariables.current_fiscal_year,
    mandatory:true,
    noselect:true,
  };
  item.inputFields=inputFields;
}
setInputFields();
const setColumns=()=>{
  let columns={}
  let key='sl_num';
  columns[key]={label: 'Serial'}
  key='status';
  columns[key]={label: labels.get('label_'+key)}
  key='dealer_id';
  columns[key]={label: labels.get('label_'+key)+' ID'}
  key='dealer_name';
  columns[key]={label: labels.get('label_'+key)}
  key='variety_id';
  columns[key]={label: labels.get('label_'+key)+' ID'}
  key='variety_name';
  columns[key]={label: labels.get('label_'+key)}
  key='quantity';
  columns[key]={label: labels.get('label_'+key)}
  item.columns.all=columns
}
setColumns();
const resetFile=(fileId)=>{
  $('#'+fileId).val('').trigger('change');//change trigger required for active
}
const saveItems=async (save_and_new)=>{
  let formData=new FormData(document.getElementById('formSaveItems'))
  await axios.post(taskData.api_url+'/save-items',formData).then((res)=>{
    if (res.data.error == "") {
      globalVariables.loadListData=true;
      toastFunctions.showSuccessfullySavedMessage();
      router.push(taskData.api_url)
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });

}

$(document).ready(function()
{
  $(document).off("change", "#file_upload_items");
  $(document).on("change",'#file_upload_items',async function()
  {
    item.exists=false;
    item.show_report=false;
    if(this.files && this.files[0])
    {
      let file=this.files[0];
      if(file.name.endsWith(".csv")){
        const reader = new FileReader();
        reader.onload = function(e) {
          let success=true;
          let data=[]
          let inputItems={}
          let rows=e.target.result.split('\n');
          let num_cols=Object.keys(item.columns.all).length-item.columns.hidden.length;
          for(let i=1;i<rows.length;i++){
            let cols=rows[i].split(',')
            let datum={}
            let inputDatum={}
            datum['sl_num']=i;
            if(cols.length==num_cols){
              datum['status']='';
              datum['dealer_id']=cols[0].trim()
              datum['dealer_name']='NF';
              datum['variety_id']=cols[1].trim()
              datum['variety_name']='NF';
              datum['quantity']=cols[2].trim()

              if(dealers_object[datum['dealer_id']] ){
                datum['dealer_name']=dealers_object[datum['dealer_id']]['name'];
              }
              else {
                datum['status']=labels.get('label_distributor_id');
              }
              if(varieties_object[datum['variety_id']] ){
                datum['variety_name']=varieties_object[datum['variety_id']]['name'];
              }
              if(!datum['status']){
                if(!inputItems[datum['dealer_id']]){
                  inputItems[datum['dealer_id']]={'dealer_id':datum['dealer_id'],'varieties':{}}
                }
                inputItems[datum['dealer_id']]['varieties'][datum['variety_id']]=datum['quantity']
                data.push(datum);
              }
              else{
                success=false;
                data.unshift(datum)
              }
            }
            else{
              if(i!=rows.length-1){
                datum['status']='Column mismatch';
                success=false;
                data.unshift(datum)
              }
            }
          }
          item.data=data;
          item.inputItems=inputItems;
          item.file_name=file.name;
          item.show_report=true;
          console.log(item.inputItems)
          if(data.length>0 && success && data.length<8000){
            item.exists=true;
          }
        };
        reader.readAsText(file);
      }
      else{
        console.log("not csv file")
      }

    }
  })
});

</script>