<template>
  <div id="accordion">
    <div class="card d-print-none">
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
    <div class="card d-print-none" v-if="taskData.permissions.action_8">
      <div class="card-header p-1">
        <a class="btn btn-sm" data-toggle="collapse" href="#label_action_8">{{labels.get('action_8')}} </a>
      </div>
      <div id="label_action_8" class="collapse show" v-if="item.exists">
        <div class="row card-body">
          <template v-for="column in taskData.columns.all">
            <div class="col-sm-6 col-md-3">
              <label><input type="checkbox" :value="column" :checked="taskData.columns.hidden.indexOf(column)<0" @change="toggleReportControlColumns($event)"> {{labels.get('label_'+column)}}</label>
            </div>
          </template>
        </div>
      </div>
    </div>

  </div>
  <div class="card" v-if="show_report">
    <div class="card-body pb-0 d-print-none">
      <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" onclick="window.print();"><i class="feather icon-printer"></i> {{labels.get('action_4')}}</button>
      <button type="button" v-if="taskData.permissions.action_5" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="exportCsv"><i class="feather icon-download"></i> {{labels.get('action_5')}}</button>
    </div>
    <div class="card-body" style='overflow-x:auto;height:600px;padding: 0'>
      <table id="table_report" :style="'width: '+table_width+'px'" class="table table-bordered sticky">
        <thead class="table-active">
        <tr>
          <template v-for="(column,key) in taskData.columns.all">
            <th style="width: 150px;" v-if="taskData.columns.hidden.indexOf(column)<0" :key="'th_'+key">
              {{labels.get('label_'+column)}}
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
        <template v-for="row in taskData.itemsFiltered">
          <tr v-for="index  in row['num_rows']" >
            <template v-for="(column,key) in taskData.columns.all">
              <td :class="((['market_size_total','market_size_arm','market_size_competitor','competitor_variety_market_size','price_approximate','upazila_market_size'].indexOf(column) != -1)?'text-right':'')" v-if="taskData.columns.hidden.indexOf(column)<0">
                <template v-if="column=='competitor_name' && row['competitor_info'].length>(index-1)">{{row['competitor_info'][index-1]['competitor_name']}}</template>
                <template v-else-if="column=='competitor_variety' && row['competitor_info'].length>(index-1)">{{row['competitor_info'][index-1]['competitor_variety']}}</template>
                <template v-else-if="column=='competitor_variety_market_size' && row['competitor_info'].length>(index-1)">{{row['competitor_info'][index-1]['competitor_variety_market_size']}}</template>
                <template v-else-if="column=='competitor_variety_sales_reason' && row['competitor_info'].length>(index-1)">{{row['competitor_info'][index-1]['competitor_variety_sales_reason']}}</template>

                <template v-else-if="column=='upazila_name' && row['upazila_info'].length>(index-1)">{{row['upazila_info'][index-1]['upazila_name']}}</template>
                <template v-else-if="column=='upazila_market_size' && row['upazila_info'].length>(index-1)">{{row['upazila_info'][index-1]['upazila_market_size']}}</template>
                <template v-else-if="column=='unions_name' && row['upazila_info'].length>(index-1)">
                  <template v-for="union_name in row['upazila_info'][index-1]['unions']">
                  {{union_name}} , <br>
                  </template>
                </template>

                <template v-else-if="column=='sowing_periods'">
                  <template v-for="(month_value,month_key) in row['sowing_periods']"><template v-if="month_value==1">{{labels.get('label_month_short_'+month_key)}} , <br></template></template>
                </template>
                <template v-else-if="index==1">{{ row[column] }}</template>
                <template v-else>&nbsp</template>
              </td>
            </template>
          </tr>
        </template>
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
    let table_width=ref(0)
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
    let varieties_object={};
    for(let i in taskData.varieties){
      varieties_object[taskData.varieties[i]['id']]=taskData.varieties[i];
    }
    let location_districts_object={};
    for(let i in taskData.location_districts){
      location_districts_object[taskData.location_districts[i]['id']]=taskData.location_districts[i];
    }
    let location_upazilas_object={};
    for(let i in taskData.location_upazilas){
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
      let key='analysis_year_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.analysis_years.map((item)=>{ return {value:item.id,label:item.name}}),
        default:taskData.analysis_years[taskData.analysis_years.length-1].id,
        mandatory:true,
        noselect:true,
      };
      key='report_format';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[{value:'crop_marketsize',label:'Crop - Market Size'},{value:'type_marketsize',label:'Type - Market Size'}],
        default:'',
        mandatory:true,
        noselect:true,
      };
      item.inputFields1=inputFields;
      //inputFields2
      inputFields={}
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
      key='division_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.location_divisions.map((item)=>{ return {value:item.id,label:item.name}}),
        default:item.data[key],
        mandatory:true
      };
      key='district_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[],
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

      item.inputFields2=inputFields;
      //inputFields3
      inputFields={}
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
      item.inputFields3=inputFields;



      await systemFunctions.delay(1);
      item.exists=true;
      await systemFunctions.delay(1);
      $('.input_container div').removeClass('col-lg-4')//to fix size

    }
    const getCompetitorInfo=(type_data)=>{
      let competitor_info={};
      for(let variety_id in type_data['competitor_info'])
      {
        competitor_info[variety_id]={};
        competitor_info[variety_id]['competitor_name']=(varieties_object[variety_id]?varieties_object[variety_id]['competitor_name']:variety_id);
        competitor_info[variety_id]['competitor_variety']=(varieties_object[variety_id]?varieties_object[variety_id]['name']:variety_id);
        competitor_info[variety_id]['competitor_variety_market_size']=type_data['competitor_info'][variety_id]['competitor_variety_market_size'];
        competitor_info[variety_id]['competitor_variety_sales_reason']=type_data['competitor_info'][variety_id]['competitor_variety_sales_reason'];
      }
      return Object.values(competitor_info);
    }
    const getUpazilaInfo=(type_data)=>{
      let upazila_info={};
      for(let upazila_id in type_data['upazila_info'])
      {
        upazila_info[upazila_id]={};
        upazila_info[upazila_id]['upazila_id']=upazila_id;
        if(upazila_id==0){
          upazila_info[upazila_id]['upazila_name']='Other';
        }
        else{
          upazila_info[upazila_id]['upazila_name']=(location_upazilas_object[upazila_id]?location_upazilas_object[upazila_id]['name']:upazila_id);
        }

        upazila_info[upazila_id]['upazila_market_size']=type_data['upazila_info'][upazila_id]['upazila_market_size'];
        upazila_info[upazila_id]['unions']=[]
      }
      let union_ids_running=type_data['union_ids_running'].split(',');
      for(let i=1;i<union_ids_running.length-1;i++){
        let union_id=union_ids_running[i];
        if(location_unions_object[union_id]){
          if(upazila_info[location_unions_object[union_id]['upazila_id']]){
            upazila_info[location_unions_object[union_id]['upazila_id']]['unions'].push(location_unions_object[union_id]['name'])
          }
        }
      }
      //console.log(union_ids_running);
      return upazila_info;
    }
    const search=async ()=>{
      show_report.value=false;
      let formData=new FormData(document.getElementById('formSearch'))
      await axios.post(taskData.api_url+'/get-items',formData).then((res)=>{
        if (res.data.error == "") {
          let report_format=$('#report_format').val();
          if(report_format=='crop_marketsize'){
            let rows={};
            for(let i in taskData.crops){
              let crop=taskData.crops[i];
              let row_available=false;
              if($('#crop_id').val()>0){
                if($('#crop_id').val()==crop['id']){
                  row_available=true;
                }
              }
              else{
                row_available=true;
              }
              if(row_available){
                rows[crop['id']]={}
                rows[crop['id']]['num_rows']=1;
                rows[crop['id']]['crop_name']=(crops_object[crop['id']]?crops_object[crop['id']]['name']:crop['id']);
                rows[crop['id']]['market_size_total']=0;
                rows[crop['id']]['market_size_arm']=0;
                rows[crop['id']]['market_size_competitor']=0;
                rows[crop['id']]['competitor_info']=[];
                rows[crop['id']]['sowing_periods']={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0}
                rows[crop['id']]['upazila_info']=[];
              }
            }
            for(let i in res.data.items){
              let type_data=res.data.items[i];
              if(rows[type_data['crop_id']])
              {
                rows[type_data['crop_id']]['market_size_total']+=(+type_data['market_size_total']);
                rows[type_data['crop_id']]['market_size_arm']+=(+type_data['market_size_arm']);
                rows[type_data['crop_id']]['market_size_competitor']+=(+type_data['market_size_competitor']);
                for(let month_key=1;month_key<13;month_key++){
                  if(type_data['sowing_periods'].indexOf(','+month_key+',')>-1){
                    rows[type_data['crop_id']]['sowing_periods'][month_key]=1;
                  }
                }
                if(!(['competitor_name','competitor_variety','competitor_variety_market_size','competitor_variety_sales_reason'].every(r=>taskData.columns.hidden.includes(r)))){
                  let competitor_info=getCompetitorInfo(type_data)
                  rows[type_data['crop_id']]['competitor_info'].push(...competitor_info);
                  rows[type_data['crop_id']]['num_rows']=Math.max(rows[type_data['crop_id']]['num_rows'],rows[type_data['crop_id']]['competitor_info'].length)
                }
                if(!(['upazila_name','upazila_market_size','unions_name'].every(r=>taskData.columns.hidden.includes(r)))){
                  let upazila_info=getUpazilaInfo(type_data)
                  for(let upazila_id in upazila_info){
                    let index_of_exits=rows[type_data['crop_id']]['upazila_info'].findIndex(x => x['upazila_id'] == upazila_id)
                    if(index_of_exits>-1){
                      rows[type_data['crop_id']]['upazila_info'][index_of_exits]['upazila_market_size']=(+rows[type_data['crop_id']]['upazila_info'][index_of_exits]['upazila_market_size'])+(+upazila_info[upazila_id]['upazila_market_size']);
                    }
                    else{
                      rows[type_data['crop_id']]['upazila_info'].push(upazila_info[upazila_id]);
                      rows[type_data['crop_id']]['num_rows']=Math.max(rows[type_data['crop_id']]['num_rows'],rows[type_data['crop_id']]['upazila_info'].length);
                    }
                  }
                }
              }
            }
            taskData.itemsFiltered=Object.values(rows);
          }
          else if(report_format=='type_marketsize'){
            let rows={};
            for(let i in taskData.crop_types){
              let crop_type=taskData.crop_types[i];
              let row_available=false;
              if($('#crop_id').val()>0){
                if($('#crop_type_id').val()>0){
                  if($('#crop_type_id').val()==crop_type['id']){
                    row_available=true;
                  }
                }
                else if($('#crop_id').val()==crop_type['crop_id']){
                  row_available=true;
                }
              }
              else{
                row_available=true;
              }
              if(row_available){
                rows[crop_type['id']]={}
                rows[crop_type['id']]['num_rows']=1;
                rows[crop_type['id']]['crop_name']=(crops_object[crop_type['crop_id']]?crops_object[crop_type['crop_id']]['name']:crop_type['crop_id']);
                rows[crop_type['id']]['type_name']=crop_type['name'];
                rows[crop_type['id']]['market_size_total']=0;
                rows[crop_type['id']]['market_size_arm']=0;
                rows[crop_type['id']]['market_size_competitor']=0;
                rows[crop_type['id']]['price_approximate']=0;
                rows[crop_type['id']]['competitor_info']=[];
                rows[crop_type['id']]['sowing_periods']={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0}
                rows[crop_type['id']]['upazila_info']=[];
              }
            }
            for(let i in res.data.items){
              let type_data=res.data.items[i];
              if(rows[type_data['type_id']])
              {
                rows[type_data['type_id']]['market_size_total']+=(+type_data['market_size_total']);
                rows[type_data['type_id']]['market_size_arm']+=(+type_data['market_size_arm']);
                rows[type_data['type_id']]['market_size_competitor']+=(+type_data['market_size_competitor']);
                rows[type_data['type_id']]['price_approximate']=Math.max(type_data['price_approximate'],rows[type_data['type_id']]['price_approximate']);
                for(let month_key=1;month_key<13;month_key++){
                  if(type_data['sowing_periods'].indexOf(','+month_key+',')>-1){
                    rows[type_data['type_id']]['sowing_periods'][month_key]=1;
                  }
                }
                if(!(['competitor_name','competitor_variety','competitor_variety_market_size','competitor_variety_sales_reason'].every(r=>taskData.columns.hidden.includes(r)))){
                  let competitor_info=getCompetitorInfo(type_data)
                  rows[type_data['type_id']]['competitor_info'].push(...competitor_info);
                  rows[type_data['type_id']]['num_rows']=Math.max(rows[type_data['type_id']]['num_rows'],rows[type_data['type_id']]['competitor_info'].length)
                }
                if(!(['upazila_name','upazila_market_size','unions_name'].every(r=>taskData.columns.hidden.includes(r)))){
                  let upazila_info=Object.values(getUpazilaInfo(type_data));
                  rows[type_data['type_id']]['upazila_info'].push(...upazila_info);//for type upazila cannot be duplicate
                  rows[type_data['type_id']]['num_rows']=Math.max(rows[type_data['type_id']]['num_rows'],rows[type_data['type_id']]['upazila_info'].length)
                }
              }
            }
            taskData.itemsFiltered=Object.values(rows);
          }
          show_report.value=true;
        }
        else{
          toastFunctions.showResponseError(res.data)
        }
      });
    }
    const exportCsv=async ()=>{
      let headers=$('#table_report thead th');
      if(headers.length>0){
        let csvStr="";
        $.each( headers, function( key, header ) {
          csvStr=csvStr+'"'+$(header).text()+'",';
        });
        csvStr+="\n";
        let rows=$('#table_report tbody tr');
        $.each( rows, function( key, row ) {
          let cols=$(row).children('td');
          $.each( cols, function( i, col ) {
            csvStr=csvStr+'"'+$(col).text().replace()+'",';
          });
          csvStr+="\n";
        });
        let hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvStr);
        hiddenElement.target = '_blank';
        hiddenElement.download = $('#report_format').val()+'.csv';
        hiddenElement.click();
      }
    }
    const toggleReportControlColumns=(event)=>{
      //show_report.value=false;
      let key=event.target .value;
      if(event.target .checked){
        taskData.columns.hidden=taskData.columns.hidden.filter(function(value) {return value !== key});
      }
      else{
        taskData.columns.hidden.push(key);
      }
      calculateTableWidth();
    }
    $(document).ready(async function()
    {
      $(document).off("change", "#report_format");
      $(document).on("change",'#report_format',function()
      {
        let report_format=$(this).val();
        let columns_all=[];
        let columns_hidden=[]
        if(report_format=='crop_marketsize'){
          columns_all=['crop_name','market_size_total','market_size_arm','market_size_competitor','competitor_name','competitor_variety','competitor_variety_market_size','competitor_variety_sales_reason','sowing_periods','upazila_name','upazila_market_size','unions_name'];
          columns_hidden=['competitor_name','competitor_variety','competitor_variety_market_size','competitor_variety_sales_reason','sowing_periods','upazila_name','upazila_market_size','unions_name'];

        }
        else if(report_format=='type_marketsize'){
          columns_all=['crop_name','type_name','market_size_total','market_size_arm','market_size_competitor','price_approximate','competitor_name','competitor_variety','competitor_variety_market_size','competitor_variety_sales_reason','sowing_periods','upazila_name','upazila_market_size','unions_name'];
          columns_hidden=['competitor_name','competitor_variety','competitor_variety_market_size','competitor_variety_sales_reason','sowing_periods','upazila_name','upazila_market_size','unions_name'];
        }
        taskData.columns.all=columns_all;
        taskData.columns.hidden=columns_hidden;
        calculateTableWidth();
      })
      await systemFunctions.delay(2);
      $('#report_format').trigger('change');

      $(document).off("change", "#crop_id");
      $(document).on("change",'#crop_id',function()
      {
        let crop_id=$(this).val();
        let key='crop_type_id';
        item.inputFields3[key].options=taskData.crop_types.filter((item)=>{ if(item.crop_id==crop_id){item.value=item.id.toString();item.label=item.name;return true}})
      })

      $(document).off("change", "#part_id");
      $(document).on("change",'#part_id',async function()
      {
        let part_id=$(this).val();
        let key='area_id';
        item.inputFields2[key].options=taskData.location_areas.filter((item)=>{ if(item.part_id==part_id){item.value=item.id.toString();item.label=item.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='territory_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#area_id");
      $(document).on("change",'#area_id',async function()
      {
        let area_id=$(this).val();
        let key='territory_id';
        item.inputFields2[key].options=taskData.location_territories.filter((item)=>{ if(item.area_id==area_id){item.value=item.id.toString();item.label=item.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
      })
      $(document).off("change", "#division_id");
      $(document).on("change",'#division_id',async function()
      {
        let division_id=$(this).val();
        let key='district_id';
        item.inputFields2[key].options=taskData.location_districts.filter((item)=>{ if(item.division_id==division_id){item.value=item.id.toString();item.label=item.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='upazila_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');
      })

      $(document).off("change", "#district_id");
      $(document).on("change",'#district_id',async function()
      {
        let district_id=$(this).val();
        let key='upazila_id';
        item.inputFields2[key].options=taskData.location_upazilas.filter((item)=>{ if(item.district_id==district_id){item.value=item.id.toString();item.label=item.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
      })

    });
    const calculateTableWidth=()=>{
      let width=(taskData.columns.all.length-taskData.columns.hidden.length)*150;

      table_width.value=width;
    }

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