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
            <label class="font-weight-bold">{{item.data.length}}</label> <small>(If more than 50000 discuss with admin)</small>
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
  columns:{all:{},hidden:['sl_num','status','distributor_name','pack_size_name']},
  data:[],
  inputItems:[],
  inputFields:{},
})
let distributors_object={};
for(let i in taskData.distributors){
  distributors_object[taskData.distributors[i]['id']]=taskData.distributors[i];
}
let pack_sizes_object={};
for(let i in taskData.pack_sizes){
  pack_sizes_object[taskData.pack_sizes[i]['id']]=taskData.pack_sizes[i];
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
  item.inputFields=inputFields;
}
setInputFields();
const setColumns=()=>{
  let columns={}
  let key='sl_num';
  columns[key]={label: 'Serial'}
  key='status';
  columns[key]={label: labels.get('label_'+key)}
  key='sales_return_at';
  columns[key]={label: 'Return Date'}
  key='invoice_no';
  columns[key]={label: labels.get('label_'+key)}
  key='sales_at';
  columns[key]={label: 'Sales Date'}
  key='distributor_id';
  columns[key]={label: labels.get('label_'+key)+' ID'}
  key='distributor_name';
  columns[key]={label: labels.get('label_'+key)}
  key='pack_size_id';
  columns[key]={label: labels.get('label_'+key)+' ID'}
  key='pack_size_name';
  columns[key]={label: labels.get('label_'+key)}
  key='quantity';
  columns[key]={label: labels.get('label_'+key)}
  key='unit_price';
  columns[key]={label: labels.get('label_'+key)}
  key='amount';
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
          let inputItems=[]
          let rows=e.target.result.split('\n');
          let num_cols=Object.keys(item.columns.all).length-item.columns.hidden.length;
          for(let i=1;i<rows.length;i++){
            let cols=rows[i].split(',')
            let datum={}
            let inputDatum={}
            datum['sl_num']=i;
            if(cols.length==num_cols){
              datum['status']='';
              datum['sales_return_at']=inputDatum['sales_return_at']=cols[0].trim()
              datum['invoice_no']=inputDatum['invoice_no']=cols[1].trim()
              datum['sales_at']=inputDatum['sales_at']=cols[2].trim()
              datum['distributor_id']=inputDatum['distributor_id']=cols[3].trim()
              datum['distributor_name']='NF';
              datum['pack_size_id']=inputDatum['pack_size_id']=cols[4].trim()
              datum['pack_size_name']='NF';
              datum['quantity']=inputDatum['quantity']=cols[5].trim()
              datum['unit_price']=inputDatum['unit_price']=cols[6].trim()
              datum['amount']=inputDatum['amount']=cols[7].trim()

              if(!datum['sales_at'])   {
                datum['status']='Sales Date';
              }
              if(!datum['sales_return_at'])   {
                datum['status']='Return Date';
              }
              if(!datum['invoice_no'])   {
                datum['status']=labels.get('label_invoice_no');
              }
              if(distributors_object[datum['distributor_id']] ){
                datum['distributor_name']=distributors_object[datum['distributor_id']]['name'];
              }
              else {
                datum['status']=labels.get('label_distributor_id');
              }
              if(pack_sizes_object[datum['pack_size_id']])   {
                datum['pack_size_name']=pack_sizes_object[datum['pack_size_id']]['name'];
              }
              else {
                datum['status']=labels.get('label_pack_size_id');
              }
              if(!datum['quantity'])   {
                datum['status']=labels.get('label_quantity');
              }
              if(!datum['unit_price'])   {
                datum['status']=labels.get('label_unit_price');
              }
              if(!datum['amount'])   {
                datum['status']=labels.get('label_amount');
              }
              if(!datum['status']){
                data.push(datum);
                inputItems.push(inputDatum);
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
          let itemsCount=inputItems.length
          if(itemsCount>0 && success && itemsCount<100000){
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