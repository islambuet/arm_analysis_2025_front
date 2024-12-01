<template>
  <div class="card mb-2">
    <div class="card-header d-print-none">
      {{labels.get('label_task')}}
    </div>
    <div class="card-body pb-0" v-if="item.exists">
      <form id="formSearch">
        <div class="row mb-2">
            <div class="col-lg-6">
              <div class="row mb-2">
                <div class="col-4">
                  <label class="font-weight-bold float-right">{{labels.get('label_year')}} <span class="text-danger">*</span></label>
                </div>
                <div class="col-8">
                  <div class="input-group" >
                    <select id="year" name="options[year]" class="form-control">
                      <option v-for="i in (globalVariables.current_year+2-globalVariables.starting_year)" :value="i+globalVariables.starting_year-1" :selected="(i+globalVariables.starting_year-1)==taskData.year">
                        {{i+globalVariables.starting_year-1}}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="row mb-2">
                <div class="col-4">
                  <label class="font-weight-bold float-right">{{labels.get('label_trial_station')}} <span class="text-danger">*</span></label>
                </div>
                <div class="col-8">
                  <div class="input-group" >
                    <select id="trial_station_id" name="options[trial_station_id]" class="form-control">
                      <option v-for="trial_station in taskData.trial_stations" :value="trial_station.id">
                        {{trial_station.name}}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="row mb-2">
                <div class="col-4">
                  <label class="font-weight-bold float-right">{{labels.get('label_season')}} <span class="text-danger">*</span></label>
                </div>
                <div class="col-8">
                  <div class="input-group" >
                    <select id="season_id" name="options[season_id]" class="form-control">
                      <option v-for="season in taskData.seasons" :value="season.id" :selected="season.id==globalVariables.current_season_id">
                        {{season.name}}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="input_container col-lg-6">
              <InputTemplate :inputItems="item.inputFields" />
              <InputTemplate :inputItems="item.inputFields2" />
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
  <div class="card" v-if="show_report">
    <div class="card-body pb-0 d-print-none">
      <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" onclick="window.print();"><i class="feather icon-printer"></i> {{labels.get('action_4')}}</button>
      <button type="button" v-if="taskData.permissions.action_5" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="systemFunctions.exportCsv(taskData.columns,taskData.itemsFiltered,taskData.api_url.substring(1)+'.csv')"><i class="feather icon-download"></i> {{labels.get('action_5')}}</button>
      <button type="button" v-if="taskData.permissions.action_8" class="mr-2 mb-2 btn btn-sm" :class="[show_column_controls?'bg-gradient-success':'bg-gradient-primary']" @click="show_column_controls = !show_column_controls"><i class="feather icon-command"></i> {{labels.get('action_8')}}</button>
    </div>
    <ColumnControl :url="taskData.api_url.substring(1)" :columns="taskData.columns"  v-if="show_column_controls"/>
    <div class="card-body" style='overflow:auto;height: 600px;'>
      <table class="table table-bordered">
        <thead class="table-active">
        <tr>
          <template v-for="(column,key) in taskData.columns.all">
            <th class="position-relative align-middle" v-if="taskData.columns.hidden.indexOf(key)<0" :key="'th_'+key">
              <div class=" text-center " style="width:calc(100% - 33px);margin-left:17px">
                {{ column.label }}
              </div>
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
          <tr v-for="item in taskData.itemsFiltered" :key="'item_'+item.id">
            <template v-for="(column,key) in taskData.columns.all">
              <td :class="((['id','ordering'].indexOf(key) != -1)?'text-right':'')+(column.class?(' '+column.class):'col_9')" v-if="taskData.columns.hidden.indexOf(key)<0" :key="'td_'+key">
                {{ (['delivered_date','sowing_date'].indexOf(key) != -1)?systemFunctions.displayDate(item[key]):item[key] }}
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
      inputFields:{},
      inputFields2:{},
      data:{
        crop_id:'',
        crop_type_id:'',
        principal_id:'',
        competitor_id:'',
      }
    })
    const setInputFields=async ()=>{
      item.inputFields= {};
      item.inputFields2= {};
      await systemFunctions.delay(1);
      let inputFields={}
      let key='crop_id';
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
      let inputFields2={}
      key='principal_id';
      inputFields2[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.principals.map((item)=>{ return {value:item.id,label:item.name}}),
        default:item.data[key],
        mandatory:false
      };
      key='competitor_id';
      inputFields2[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.competitors.map((item)=>{ return {value:item.id,label:item.name}}),
        default:item.data[key],
        mandatory:false
      };

      item.inputFields=inputFields;
      item.inputFields2=inputFields2;
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
          taskData.items= res.data.items;
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
        console.log(crop_id)
        let key='crop_type_id';
        item.inputFields[key].options=taskData.crop_types.filter((item)=>{ if(item.crop_id==crop_id){item.value=item.id.toString();item.label=item.name;return true}})
      })
    });
    const setColumns=()=>{
      let columns={}
      let key='rnd_code';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''},
      };
      key='delivered_date';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'date',
        filter:{from:'',to:''}
      };
      key='sowing_date';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'date',
        filter:{from:'',to:''}
      };
      key='name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:false,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };
      key='crop_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'dropdown',
        filter:{from:'',to:'',options:taskData.crops.map((item)=>{ return {value:item.name,label:item.name}}),}
      };
      key='crop_type_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };

      key='principal_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        sortable:true,
        filterable:true,
        type:'dropdown',
        filter:{from:'',to:'',options:[{value:'ARM',label:'ARM'},{value:'Principal',label:'Principal'},{value:'Competitor',label:'Competitor'}]},

      };
      key='competitor_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        sortable:true,
        filterable:true,
        type:'dropdown',
        filter:{from:'',to:'',options:[{value:'ARM',label:'ARM'},{value:'Principal',label:'Principal'},{value:'Competitor',label:'Competitor'}]},
      };
      taskData.columns.all=columns
    }
    setColumns();
    setInputFields();


</script>

