<template>
  <div id="accordion">
    <div class="card">
      <div class="card-header p-1">
        <a class="btn btn-sm" data-toggle="collapse" href="#label_task">{{labels.get('label_task')}} </a>
      </div>
      <div id="label_task" class="collapse show" v-if="item.exists">
        <form id="formSearch">
          <div class="row mt-2">
            <div class="input_container col-lg-4">
              <InputTemplate :inputItems="item.inputFields1" />
            </div>
            <div class="input_container col-lg-4">
              <InputTemplate :inputItems="item.inputFields2" />
            </div>
            <div class="input_container col-lg-4">
              <InputTemplate :inputItems="item.inputFields3" />
            </div>
          </div>
        </form>
        <div class="row">
          <div class="col-12 text-center">
            <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="search"><i class="feather icon-save"></i> {{labels.get('label_search')}}</button>
          </div>
        </div>
      </div>

    </div>

  </div>
  <div class="card" v-if="show_report">
    <div class="card-body pb-0 d-print-none">
      <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" onclick="window.print();"><i class="feather icon-printer"></i> {{labels.get('action_4')}}</button>
      <button type="button" v-if="taskData.permissions.action_5" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="systemFunctions.exportCsv(taskData.columns,taskData.itemsFiltered,taskData.api_url.substring(1)+'.csv')"><i class="feather icon-download"></i> {{labels.get('action_5')}}</button>
      <button type="button" v-if="taskData.permissions.action_8" class="mr-2 mb-2 btn btn-sm" :class="[show_column_controls?'bg-gradient-success':'bg-gradient-primary']" @click="show_column_controls = !show_column_controls"><i class="feather icon-command"></i> {{labels.get('action_8')}}</button>
    </div>
    <ColumnControl :url="taskData.api_url.substring(1)" :columns="taskData.columns"  v-if="show_column_controls"/>
    <div class="card-body" style='overflow-x:auto;height:600px;padding: 0'>
      <table style="width: 2250px;" class="table table-bordered sticky">
        <thead class="table-active">
        <tr>
          <template v-for="(column,key) in taskData.columns.all">
            <th style="width: 150px;" v-if="taskData.columns.hidden.indexOf(key)<0" :key="'th_'+key">
              {{ column.label }}
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
          <tr v-for="item in taskData.itemsFiltered" :key="'item_'+item.id">
            <template v-for="(column,key) in taskData.columns.all">
              <td :class="((['market_size_crop','market_size_total','upazila_market_size','market_size_arm','type_competitor_market_size_variety','type_competitor_market_size_total'].indexOf(key) != -1)?'text-right':'')+(column.class?(' '+column.class):' col_9')" v-if="taskData.columns.hidden.indexOf(key)<0" :key="'td_'+key">
                {{ item[key] }}
              </td>
            </template>

          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>
<script setup>
    import globalVariables from "@/assets/globalVariables";
    import systemFunctions from "@/assets/systemFunctions";

    import labels from '@/labels'
    import {inject, reactive, ref} from 'vue'
    import {useRouter} from 'vue-router';
    import axios from "axios";
    import InputTemplate from '@/components/InputTemplate.vue';
    import ColumnControl from '@/components/ColumnControl.vue';
    import toastFunctions from "@/assets/toastFunctions";

    const router =useRouter()
    let taskData = inject('taskData')
    let show_report=ref(false)
    let show_column_controls=ref(false)
    let item=reactive({

      exists:false,
      inputFields1:{},
      inputFields2:{},
      inputFields3:{},
      data:{

      }
    })
    let crops_object={};
    for(let i in taskData.crops){
      crops_object[taskData.crops[i]['id']]=taskData.crops[i];
    }
    let crop_types_object={};
    for(let i in taskData.crop_types){
      crop_types_object[taskData.crop_types[i]['id']]=taskData.crop_types[i];
    }
    let location_districts_object={};
    for(let i in taskData.location_districts){
      location_districts_object[taskData.location_districts[i]['id']]=taskData.location_districts[i];
    }
    let location_upazilas_object={};
    for(let i in taskData.location_districts){
      location_upazilas_object[taskData.location_upazilas[i]['id']]=taskData.location_upazilas[i];
    }
    let location_unions_object={};
    for(let i in taskData.location_unions){
      location_unions_object[taskData.location_unions[i]['id']]=taskData.location_unions[i];
    }

    const setInputFields=async ()=>{
      item.inputFields1= {};
      item.inputFields2= {};
      item.inputFields3= {};
      await systemFunctions.delay(1);
      let inputFields={}
      //inputFields1
      let key='analysis_year_id';
      key='part_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.location_parts.map((item)=>{ return {value:item.id,label:item.name}}),
        default:item.data[key],
        mandatory:false
      };
      key='area_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[],
        default:item.data[key],
        mandatory:false
      };
      key='territory_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[],
        default:item.data[key],
        mandatory:false
      };
      key='district_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.location_districts.map((item)=>{ return {value:item.id,label:item.name}}),
        default:item.data[key],
        mandatory:true
      };
      key='upazila_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[],
        default:item.data[key],
        mandatory:true
      };

      item.inputFields1=inputFields;
      //inputFields2
      inputFields={}
      key='analysis_year_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.analysis_years.map((item)=>{ return {value:item.id,label:item.name}}),
        default:taskData.analysis_years[taskData.analysis_years.length-1].id,
        mandatory:true
      };
      key='crop_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.crops.map((item)=>{ return {value:item.id,label:item.name}}),
        default:item.data[key],
        mandatory:false
      };
      key='crop_type_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[],
        default:item.data[key],
        mandatory:false
      };
      item.inputFields2=inputFields;

      //inputFields3
      inputFields={}
      key='principal_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.principals.map((item)=>{ return {value:item.id,label:item.name}}),
        default:item.data[key],
        mandatory:false
      };
      key='competitor_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.competitors.map((item)=>{ return {value:item.id,label:item.name}}),
        default:item.data[key],
        mandatory:false
      };

      item.inputFields3=inputFields;

      await systemFunctions.delay(1);
      item.exists=true;
      await systemFunctions.delay(1);
      $('.input_container div').removeClass('col-lg-4')//to fix size

    }

    const search=async ()=>{
      show_report.value=false;
      let formData=new FormData(document.getElementById('formSearch'))
      await axios.post(taskData.api_url+'/get-items',formData).then((res)=>{
        if (res.data.error == "") {
          let items={};
          items['data']=[];
          for(let i in res.data.items){
            let type_data=res.data.items[i];
            let crop_name=(crops_object[type_data['crop_id']]?crops_object[type_data['crop_id']]['name']:type_data['crop_id']);
            let crop_type_name=(crop_types_object[type_data['type_id']]?crop_types_object[type_data['type_id']]['name']:type_data['type_id']);
            let district_name=(location_districts_object[type_data['district_id']]?location_districts_object[type_data['district_id']]['name']:type_data['district_id']);
            let market_size_total=type_data['market_size_total'];
            let market_size_arm=type_data['market_size_arm'];
            let market_size_competitor=type_data['market_size_competitor'];
            let upazila_market_size=type_data['upazila_market_size'].split(',');
            let union_ids_running=type_data['union_ids_running'].split(',');
            let sowing_periods=type_data['sowing_periods'].split(',');
            let competitor_market_size=type_data['competitor_market_size'].split(',');
            let competitor_sales_reason=type_data['competitor_market_size'].split(',,,');
            let num_type_row=Math.max(3,upazila_market_size.length,competitor_market_size.length)-2;
            let rows=[];
            for(let i=0;i<num_type_row;i++){
              let row={}
              row['crop_name']=(i==0?crop_name:'');
              row['type_name']=(i==0?crop_type_name:'');
              row['district_name']=(i==0?district_name:'');
              row['market_size_total']=(i==0?market_size_total:'');
              row['unions_name']=',';
              rows.push(row);
            }
            //console.log(rows[0]['crop_name']);
            for(let i=1;i<upazila_market_size.length-1;i++){
              let upazila_id=upazila_market_size[i].substring(0,upazila_market_size[i].indexOf('_'));
              let quantity=upazila_market_size[i].substring(upazila_market_size[i].indexOf('_')+1);
              rows[i-1]['upazila_name']=(location_upazilas_object[upazila_id]?location_upazilas_object[upazila_id]['name']:upazila_id);
              rows[i-1]['upazila_market_size']=quantity;
              for(let j=1;j<union_ids_running.length-1;j++){
                if((location_unions_object[union_ids_running[j]])&&(location_unions_object[union_ids_running[j]]['upazila_id']==upazila_id))
                {
                  rows[i-1]['unions_name']+=(location_unions_object[union_ids_running[j]]['name']+',');
                }
              }

            }
            for(i=0;i<rows.length;i++){
              items['data'].push(rows[i]);
            }
          }
          items['current_page']=1;
          items['last_page1']=1;
          items['total']=items['data'].length;
          taskData.items= items;

          //taskData.items= res.data.items;
          taskData.setFilteredItems();
          show_report.value=true;
        }
        else{
          toastFunctions.showResponseError(res.data)
        }
      });
    }

    $(document).ready(function()
    {
      $(document).off("change", "#crop_id");
      $(document).on("change",'#crop_id',function()
      {
        let crop_id=$(this).val();
        let key='crop_type_id';
        item.inputFields2[key].options=taskData.crop_types.filter((item)=>{ if(item.crop_id==crop_id){item.value=item.id.toString();item.label=item.name;return true}})
      })

      $(document).off("change", "#part_id");
      $(document).on("change",'#part_id',async function()
      {
        let part_id=$(this).val();
        let key='area_id';
        item.inputFields1[key].options=taskData.location_areas.filter((item)=>{ if(item.part_id==part_id){item.value=item.id.toString();item.label=item.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='territory_id';
        item.inputFields1[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#area_id");
      $(document).on("change",'#area_id',async function()
      {
        let area_id=$(this).val();
        let key='territory_id';
        item.inputFields1[key].options=taskData.location_territories.filter((item)=>{ if(item.area_id==area_id){item.value=item.id.toString();item.label=item.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
      })
      $(document).off("change", "#district_id");
      $(document).on("change",'#district_id',function()
      {
        let district_id=$(this).val();
        let key='upazila_id';
        item.inputFields1[key].options=taskData.location_upazilas.filter((item)=>{ if(item.district_id==district_id){item.value=item.id.toString();item.label=item.name;return true}})
      })
    });
    const setColumns=()=>{
      let columns={}
      let key='crop_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'text',
        filter:{from:'',to:''}
      };
      key='market_size_crop';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'number',
        filter:{from:'',to:''}
      };
      key='type_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'text',
        filter:{from:'',to:''}
      };

      key='market_size_total';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'number',
        filter:{from:'',to:''}
      };
      key='district_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'text',
        filter:{from:'',to:''}
      };
      key='upazila_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'text',
        filter:{from:'',to:''}
      };
      key='upazila_market_size';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'number',
        filter:{from:'',to:''}
      };
      key='unions_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'text',
        filter:{from:'',to:''}
      };
      key='sowing_periods';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'text',
        filter:{from:'',to:''}
      };


      key='market_size_arm';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'number',
        filter:{from:'',to:''}
      };
      key='sowing_periods';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'text',
        filter:{from:'',to:''}
      };
      key='competitor_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'text',
        filter:{from:'',to:''}
      };

      key='competitor_variety';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'text',
        filter:{from:'',to:''}
      };
      key='competitor_market_size';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'number',
        filter:{from:'',to:''}
      };

      key='competitor_sales_reason';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'text',
        filter:{from:'',to:''}
      };
      key='market_size_competitor';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:false,
        type:'number',
        filter:{from:'',to:''}
      };
      taskData.columns.all=columns
    }
    setColumns();
    setInputFields();


</script>


<style scoped>

/* To show borders. overwrite bootstarp css */
table.sticky {
  border-collapse: separate;
  border-spacing: 0;
}
table.sticky >thead th{
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 1030;
  background:#f5f5f5;
  border-width: 1px;
  width: 100px;
}
table.sticky > thead > tr > th:nth-child(1){
  left: 0;
  z-index: 1040;
}
table.sticky > thead > tr > th:nth-child(2){
  left: 150px;
  z-index: 1040;
}

table.sticky > tbody > tr > td:nth-child(1){
  position: sticky;
  position: -webkit-sticky;
  left: 0;
  z-index: 1020;
  background:#f5f5f5;
  border-width: 1px;
}

table.sticky > tbody > tr > td:nth-child(2){
  position: sticky;
  position: -webkit-sticky;
  left: 150px;
  z-index: 1020;
  background:#f5f5f5;
  border-width: 1px;
}
</style>