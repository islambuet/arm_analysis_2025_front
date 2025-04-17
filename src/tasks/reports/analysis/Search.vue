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
          <template v-for="column in taskData.columns.selectable">
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
            <th style="width: 150px;" v-if="taskData.columns.hidden.indexOf(column.group)<0" :key="'th_'+key">
              <div v-html="column.label"></div>
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
        <template v-for="row in taskData.itemsFiltered">
          <tr v-for="index  in row['num_rows']" >
            <template v-for="(column,key) in taskData.columns.all">
              <td :class="((['market_size_location_total','market_size_total','market_size_arm','market_size_competitor','competitor_variety_market_size','price_approximate','upazila_market_size'].indexOf(column.group) != -1)?'text-right':'')" v-if="taskData.columns.hidden.indexOf(column.group)<0">
                <template v-if="column.group=='competitor_variety' && row['competitor_info'].length>(index-1)">{{row['competitor_info'][index-1][column.key]}}</template>
                <template v-else-if="column.group=='competitor_variety_market_size' && row['competitor_info'].length>(index-1)">{{row['competitor_info'][index-1][column.key]}}</template>
                <template v-else-if="column.group=='competitor_variety_sales_reason' && row['competitor_info'].length>(index-1)">{{row['competitor_info'][index-1][column.key]}}</template>

                <template v-else-if="column.group=='upazila_name' && row['upazila_info'].length>(index-1)">{{row['upazila_info'][index-1][column.key]}}</template>
                <template v-else-if="column.group=='upazila_market_size' && row['upazila_info'].length>(index-1)">{{row['upazila_info'][index-1][column.key]}}</template>
                <template v-else-if="column.group=='unions_name' && row['upazila_info'].length>(index-1)">
                  <template v-for="union_name in row['upazila_info'][index-1]['unions']">
                    {{union_name}} , <br>
                  </template>
                </template>

                <template v-else-if="column.group=='sowing_periods'">
                  <template v-for="(month_value,month_key) in row[column.key]"><template v-if="month_value==1">{{labels.get('label_month_short_'+month_key)}} , <br></template></template>
                </template>
                <template v-else-if="index==1">{{ row[column.key] }}</template>
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
    let location_parts_object={};
    for(let i in taskData.location_parts){
      let id=taskData.location_parts[i]['id'];
      location_parts_object[id]=taskData.location_parts[i];
      location_parts_object[id]['area_ids']=[];
      location_parts_object[id]['district_ids']=[];
    }
    let location_areas_object={};
    for(let i in taskData.location_areas){
      let id=taskData.location_areas[i]['id'];
      location_areas_object[id]=taskData.location_areas[i];
      location_areas_object[id]['territory_ids']=[];
      location_areas_object[id]['district_ids']=[];
    }
    let location_territories_object={};
    for(let i in taskData.location_territories){
      let id=taskData.location_territories[i]['id'];
      location_territories_object[id]=taskData.location_territories[i];
      location_territories_object[id]['upazila_ids']=[];
      location_territories_object[id]['district_ids']=[];
      location_areas_object[taskData.location_territories[i]['area_id']]['territory_ids'].push(id);
    }

    let location_divisions_object={};
    for(let i in taskData.location_divisions){
      let id=taskData.location_divisions[i]['id'];
      location_divisions_object[id]=taskData.location_divisions[i];
      location_divisions_object[id]['district_ids']=[];
    }

    let location_districts_object={};
    for(let i in taskData.location_districts){
      let id=taskData.location_districts[i]['id'];
      location_districts_object[id]=taskData.location_districts[i];
      location_districts_object[id]['upazila_ids']=[]
      location_divisions_object[taskData.location_districts[i]['division_id']]['district_ids'].push(id);
    }

    let location_upazilas_object={};
    for(let i in taskData.location_upazilas){
      let id=taskData.location_upazilas[i]['id'];
      let territory_id=taskData.location_upazilas[i]['territory_id'];
      let district_id=taskData.location_upazilas[i]['district_id'];
      let area_id=location_territories_object[territory_id]['area_id'];
      let part_id=location_areas_object[area_id]['part_id'];

      location_upazilas_object[id]=taskData.location_upazilas[i];

      location_districts_object[district_id]['upazila_ids'].push(id);
      location_territories_object[territory_id]['upazila_ids'].push(id);

      if(!location_territories_object[territory_id]['district_ids'].includes(district_id))
      {
        location_territories_object[territory_id]['district_ids'].push(district_id);
      }
      if(!location_areas_object[area_id]['district_ids'].includes(district_id))
      {
        location_areas_object[area_id]['district_ids'].push(district_id);
      }
      if(!location_parts_object[part_id]['district_ids'].includes(district_id))
      {
        location_parts_object[part_id]['district_ids'].push(district_id);
      }

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
        options:[{value:'crop_marketsize',label:'Crop - Market Size'},{value:'type_marketsize',label:'Type - Market Size'},
          {value:'crop_arm_location',label:'Crop - ARM Location'},{value:'type_arm_location',label:'Type - ARM Location'},
          {value:'crop_country_location',label:'Crop - Country Location'},{value:'type_country_location',label:'Type - Country Location'}],
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
        competitor_info[variety_id]['variety_id']=variety_id;
        if(variety_id==0){
          competitor_info[variety_id]['competitor_name']="";
          competitor_info[variety_id]['competitor_variety']='Other';
        }
        else{
          competitor_info[variety_id]['competitor_name']=(varieties_object[variety_id]?varieties_object[variety_id]['competitor_name']:variety_id);
          competitor_info[variety_id]['competitor_variety']=(varieties_object[variety_id]?varieties_object[variety_id]['name']:variety_id);
        }

        competitor_info[variety_id]['competitor_variety_market_size']=type_data['competitor_info'][variety_id]['competitor_variety_market_size'];
        competitor_info[variety_id]['competitor_variety_sales_reason']=type_data['competitor_info'][variety_id]['competitor_variety_sales_reason'];
      }
      return competitor_info;
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
          taskData.itemsFiltered=[];
          let columns_all=[];
          let rows={};
          let report_format=$('#report_format').val();
          if(report_format=='crop_marketsize'){
            columns_all.push({'group':'crop_name','key':'crop_name','label':labels.get('label_crop_name')})
            columns_all.push({'group':'market_size_total','key':'market_size_total','label':labels.get('label_market_size_total')})
            columns_all.push({'group':'market_size_arm','key':'market_size_arm','label':labels.get('label_market_size_arm')})
            columns_all.push({'group':'market_size_competitor','key':'market_size_competitor','label':labels.get('label_market_size_competitor')})
            columns_all.push({'group':'competitor_variety','key':'competitor_name','label':labels.get('label_competitor_name')})
            columns_all.push({'group':'competitor_variety','key':'competitor_variety','label':labels.get('label_competitor_variety')})
            columns_all.push({'group':'competitor_variety_market_size','key':'competitor_variety_market_size','label':labels.get('label_competitor_variety_market_size')})
            columns_all.push({'group':'competitor_variety_sales_reason','key':'competitor_variety_sales_reason','label':labels.get('label_competitor_variety_sales_reason')})
            columns_all.push({'group':'sowing_periods','key':'sowing_periods','label':labels.get('label_sowing_periods')})
            columns_all.push({'group':'upazila_name','key':'upazila_name','label':labels.get('label_upazila_name')})
            columns_all.push({'group':'upazila_market_size','key':'upazila_market_size','label':labels.get('label_upazila_market_size')})
            columns_all.push({'group':'unions_name','key':'unions_name','label':labels.get('label_unions_name')})
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
                if(!(['competitor_variety','competitor_variety_market_size','competitor_variety_sales_reason'].every(r=>taskData.columns.hidden.includes(r)))){
                  let competitor_info=getCompetitorInfo(type_data)
                  for(let variety_id in competitor_info){
                    let index_of_exits=rows[type_data['crop_id']]['competitor_info'].findIndex(x => x['variety_id'] == variety_id)
                    if(index_of_exits>-1){
                      rows[type_data['crop_id']]['competitor_info'][index_of_exits]['competitor_variety_market_size']=(+rows[type_data['crop_id']]['competitor_info'][index_of_exits]['competitor_variety_market_size'])+(+competitor_info[variety_id]['competitor_variety_market_size']);
                      if(competitor_info[variety_id]['competitor_variety_sales_reason'].length>0){
                        rows[type_data['crop_id']]['competitor_info'][index_of_exits]['competitor_variety_sales_reason']=(rows[type_data['crop_id']]['competitor_info'][index_of_exits]['competitor_variety_sales_reason'])+' , '+(competitor_info[variety_id]['competitor_variety_sales_reason']);
                      }
                    }
                    else {
                      rows[type_data['crop_id']]['competitor_info'].push(competitor_info[variety_id]);
                      rows[type_data['crop_id']]['num_rows'] = Math.max(rows[type_data['crop_id']]['num_rows'], rows[type_data['crop_id']]['competitor_info'].length)
                    }
                  }

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

          }
          else if(report_format=='type_marketsize'){
            columns_all.push({'group':'crop_name','key':'crop_name','label':labels.get('label_crop_name')})
            columns_all.push({'group':'type_name','key':'type_name','label':labels.get('label_type_name')})
            columns_all.push({'group':'market_size_total','key':'market_size_total','label':labels.get('label_market_size_total')})
            columns_all.push({'group':'market_size_arm','key':'market_size_arm','label':labels.get('label_market_size_arm')})
            columns_all.push({'group':'market_size_competitor','key':'market_size_competitor','label':labels.get('label_market_size_competitor')})
            columns_all.push({'group':'price_approximate','key':'price_approximate','label':labels.get('label_price_approximate')})
            columns_all.push({'group':'competitor_variety','key':'competitor_name','label':labels.get('label_competitor_name')})
            columns_all.push({'group':'competitor_variety','key':'competitor_variety','label':labels.get('label_competitor_variety')})
            columns_all.push({'group':'competitor_variety_market_size','key':'competitor_variety_market_size','label':labels.get('label_competitor_variety_market_size')})
            columns_all.push({'group':'competitor_variety_sales_reason','key':'competitor_variety_sales_reason','label':labels.get('label_competitor_variety_sales_reason')})
            columns_all.push({'group':'sowing_periods','key':'sowing_periods','label':labels.get('label_sowing_periods')})
            columns_all.push({'group':'upazila_name','key':'upazila_name','label':labels.get('label_upazila_name')})
            columns_all.push({'group':'upazila_market_size','key':'upazila_market_size','label':labels.get('label_upazila_market_size')})
            columns_all.push({'group':'unions_name','key':'unions_name','label':labels.get('label_unions_name')})

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
                if(!(['competitor_variety','competitor_variety_market_size','competitor_variety_sales_reason'].every(r=>taskData.columns.hidden.includes(r)))){
                  let competitor_info=getCompetitorInfo(type_data)
                  for(let variety_id in competitor_info){
                    let index_of_exits=rows[type_data['type_id']]['competitor_info'].findIndex(x => x['variety_id'] == variety_id)
                    if(index_of_exits>-1){
                      rows[type_data['type_id']]['competitor_info'][index_of_exits]['competitor_variety_market_size']=(+rows[type_data['type_id']]['competitor_info'][index_of_exits]['competitor_variety_market_size'])+(+competitor_info[variety_id]['competitor_variety_market_size']);
                      if(competitor_info[variety_id]['competitor_variety_sales_reason'].length>0){
                        rows[type_data['type_id']]['competitor_info'][index_of_exits]['competitor_variety_sales_reason']=(rows[type_data['type_id']]['competitor_info'][index_of_exits]['competitor_variety_sales_reason'])+' , '+(competitor_info[variety_id]['competitor_variety_sales_reason']);
                      }
                    }
                    else {
                      rows[type_data['type_id']]['competitor_info'].push(competitor_info[variety_id]);
                      rows[type_data['type_id']]['num_rows'] = Math.max(rows[type_data['type_id']]['num_rows'], rows[type_data['type_id']]['competitor_info'].length)
                    }
                  }

                }
                if(!(['upazila_name','upazila_market_size','unions_name'].every(r=>taskData.columns.hidden.includes(r)))){
                  let upazila_info=Object.values(getUpazilaInfo(type_data));
                  rows[type_data['type_id']]['upazila_info'].push(...upazila_info);//for type upazila cannot be duplicate
                  rows[type_data['type_id']]['num_rows']=Math.max(rows[type_data['type_id']]['num_rows'],rows[type_data['type_id']]['upazila_info'].length)
                }
              }
            }
          }
          else if(report_format=='crop_arm_location'){
            columns_all.push({'group':'crop_name','key':'crop_name','label':labels.get('label_crop_name')})
            let location_type='';
            let location_id=0;
            let locations=[];
            if($('#territory_id').val()>0){
              location_type='Territory';
              location_id=$('#territory_id').val();
              for(let i in location_territories_object[location_id]['upazila_ids']){
                locations.push(location_upazilas_object[location_territories_object[location_id]['upazila_ids'][i]]);
              }
            }
            else if($('#area_id').val()>0){
              location_type='Area';
              location_id=$('#area_id').val();
              for(let i in location_areas_object[location_id]['territory_ids']){
                locations.push(location_territories_object[location_areas_object[location_id]['territory_ids'][i]]);
              }
            }
            else if($('#part_id').val()>0){
              location_type='Part';
              location_id=$('#part_id').val();
              locations=taskData.location_areas.filter((temp)=>{ if(temp.part_id==location_id){return true}})
            }
            else{
              location_type='National';
              locations=taskData.location_parts;
            }
            columns_all.push({'group':'market_size_location_total','key':'market_size_location_total','label':'Total Market Size</br>('+location_type+')'})
            for(let index in locations){
              columns_all.push({'group':'market_size_total','key':'market_size_total_'+locations[index].id,'label':labels.get('label_market_size_total')+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'market_size_arm','key':'market_size_arm_'+locations[index].id,'label':labels.get('label_market_size_arm')+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'market_size_competitor','key':'market_size_competitor_'+locations[index].id,'label':labels.get('label_market_size_competitor')+'</br>('+locations[index].name+')'})
            }
            if(location_type=='Territory'){
              columns_all.push({'group':'market_size_total','key':'market_size_total_0','label':labels.get('label_market_size_total')+'</br>(other)'})
              columns_all.push({'group':'market_size_arm','key':'market_size_arm_0','label':labels.get('label_market_size_arm')+'</br>(other)'})
              columns_all.push({'group':'market_size_competitor','key':'market_size_competitor_0','label':labels.get('label_market_size_competitor')+'</br>(other)'})
            }
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
                rows[crop['id']]['market_size_location_total']=0;
                for(let index in locations){
                  rows[crop['id']]['market_size_total_'+locations[index].id]=0;
                  rows[crop['id']]['market_size_arm_'+locations[index].id]=0;
                  rows[crop['id']]['market_size_competitor_'+locations[index].id]=0;
                }
                if(location_type=='Territory'){
                  rows[crop['id']]['market_size_total_0']=0;
                  rows[crop['id']]['market_size_arm_0']=0;
                  rows[crop['id']]['market_size_competitor_0']=0;
                }
              }
            }
            for(let i in res.data.items){
              let type_data=res.data.items[i];
              if(rows[type_data['crop_id']])
              {
                if($('#territory_id').val()>0){
                  let upazila_info=getUpazilaInfo(type_data)
                  let territory_id=$('#territory_id').val();
                    for(let upazila_id in upazila_info){
                      if(upazila_id==0 || (location_territories_object[territory_id]['upazila_ids'].includes(+upazila_id))){//checking in case upazilla changed.
                        rows[type_data['crop_id']]['market_size_total_'+upazila_id]+=(+upazila_info[upazila_id]['upazila_market_size']);//only this upazila data form api.
                      }
                    }
                  rows[type_data['crop_id']]['market_size_location_total']+=(+type_data['market_size_total']);

                }
                else if($('#area_id').val()>0){
                  let upazila_info=getUpazilaInfo(type_data)
                  for(let upazila_id in upazila_info){
                    if(upazila_id==0){
                      for(let territory_id in location_territories_object){
                        if(location_territories_object[territory_id]['district_ids'].includes(type_data['district_id'])){
                          rows[type_data['crop_id']]['market_size_total_'+territory_id]+=(+upazila_info[upazila_id]['upazila_market_size']);
                        }
                      }
                    }
                    else{
                      let territory_id=location_upazilas_object[upazila_id]['territory_id'];
                      rows[type_data['crop_id']]['market_size_total_'+territory_id]+=(+upazila_info[upazila_id]['upazila_market_size']);
                    }
                  }
                  rows[type_data['crop_id']]['market_size_location_total']+=(+type_data['market_size_total']);
                }
                else if($('#part_id').val()>0){
                  for(let area_id in location_areas_object){
                    if(location_areas_object[area_id]['district_ids'].includes(type_data['district_id'])){
                      rows[type_data['crop_id']]['market_size_total_'+area_id]+=(+type_data['market_size_total']);
                      rows[type_data['crop_id']]['market_size_arm_'+area_id]+=(+type_data['market_size_arm']);
                      rows[type_data['crop_id']]['market_size_competitor_'+area_id]+=(+type_data['market_size_competitor']);
                    }
                  }
                  rows[type_data['crop_id']]['market_size_location_total']+=(+type_data['market_size_total']);
                }
                else{
                  for(let part_id in location_parts_object){
                    if(location_parts_object[part_id]['district_ids'].includes(type_data['district_id'])){
                      rows[type_data['crop_id']]['market_size_total_'+part_id]+=(+type_data['market_size_total']);
                      rows[type_data['crop_id']]['market_size_arm_'+part_id]+=(+type_data['market_size_arm']);
                      rows[type_data['crop_id']]['market_size_competitor_'+part_id]+=(+type_data['market_size_competitor']);
                    }
                  }
                  rows[type_data['crop_id']]['market_size_location_total']+=(+type_data['market_size_total']);
                }
              }
            }
          }
          else if(report_format=='type_arm_location'){
            columns_all.push({'group':'crop_name','key':'crop_name','label':labels.get('label_crop_name')})
            columns_all.push({'group':'type_name','key':'type_name','label':labels.get('label_type_name')})
            let location_type='';
            let location_id=0;
            let locations=[];
            if($('#territory_id').val()>0){
              location_type='Territory';
              location_id=$('#territory_id').val();
              for(let i in location_territories_object[location_id]['upazila_ids']){
                locations.push(location_upazilas_object[location_territories_object[location_id]['upazila_ids'][i]]);
              }
            }
            else if($('#area_id').val()>0){
              location_type='Area';
              location_id=$('#area_id').val();
              for(let i in location_areas_object[location_id]['territory_ids']){
                locations.push(location_territories_object[location_areas_object[location_id]['territory_ids'][i]]);
              }
            }
            else if($('#part_id').val()>0){
              location_type='Part';
              location_id=$('#part_id').val();
              locations=taskData.location_areas.filter((temp)=>{ if(temp.part_id==location_id){return true}})
            }
            else{
              location_type='National';
              locations=taskData.location_parts;
            }
            columns_all.push({'group':'market_size_location_total','key':'market_size_location_total','label':'Total Market Size</br>('+location_type+')'})
            for(let index in locations){
              columns_all.push({'group':'market_size_total','key':'market_size_total_'+locations[index].id,'label':labels.get('label_market_size_total')+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'market_size_arm','key':'market_size_arm_'+locations[index].id,'label':labels.get('label_market_size_arm')+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'market_size_competitor','key':'market_size_competitor_'+locations[index].id,'label':labels.get('label_market_size_competitor')+'</br>('+locations[index].name+')'})
            }
            if(location_type=='Territory'){
              columns_all.push({'group':'market_size_total','key':'market_size_total_0','label':labels.get('label_market_size_total')+'</br>(other)'})
              columns_all.push({'group':'market_size_arm','key':'market_size_arm_0','label':labels.get('label_market_size_arm')+'</br>(other)'})
              columns_all.push({'group':'market_size_competitor','key':'market_size_competitor_0','label':labels.get('label_market_size_competitor')+'</br>(other)'})
            }
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
                rows[crop_type['id']]['market_size_location_total']=0;
                for(let index in locations){
                  rows[crop_type['id']]['market_size_total_'+locations[index].id]=0;
                  rows[crop_type['id']]['market_size_arm_'+locations[index].id]=0;
                  rows[crop_type['id']]['market_size_competitor_'+locations[index].id]=0;
                }
                if(location_type=='Territory'){
                  rows[crop_type['id']]['market_size_total_0']=0;
                  rows[crop_type['id']]['market_size_arm_0']=0;
                  rows[crop_type['id']]['market_size_competitor_0']=0;
                }
              }
            }
            for(let i in res.data.items){
              let type_data=res.data.items[i];
              if(rows[type_data['crop_id']])
              {
                if($('#territory_id').val()>0){
                  let upazila_info=getUpazilaInfo(type_data)
                  let territory_id=$('#territory_id').val();
                  for(let upazila_id in upazila_info){
                    if(upazila_id==0 || (location_territories_object[territory_id]['upazila_ids'].includes(+upazila_id))){//checking in case upazilla changed.
                      rows[type_data['type_id']]['market_size_total_'+upazila_id]+=(+upazila_info[upazila_id]['upazila_market_size']);//only this upazila data form api.
                    }
                  }
                  rows[type_data['type_id']]['market_size_location_total']+=(+type_data['market_size_total']);

                }
                else if($('#area_id').val()>0){
                  let upazila_info=getUpazilaInfo(type_data)
                  for(let upazila_id in upazila_info){
                    if(upazila_id==0){
                      for(let territory_id in location_territories_object){
                        if(location_territories_object[territory_id]['district_ids'].includes(type_data['district_id'])){
                          rows[type_data['type_id']]['market_size_total_'+territory_id]+=(+upazila_info[upazila_id]['upazila_market_size']);
                        }
                      }
                    }
                    else{
                      let territory_id=location_upazilas_object[upazila_id]['territory_id'];
                      rows[type_data['type_id']]['market_size_total_'+territory_id]+=(+upazila_info[upazila_id]['upazila_market_size']);
                    }
                  }
                  rows[type_data['type_id']]['market_size_location_total']+=(+type_data['market_size_total']);
                }
                else if($('#part_id').val()>0){
                  for(let area_id in location_areas_object){
                    if(location_areas_object[area_id]['district_ids'].includes(type_data['district_id'])){
                      rows[type_data['type_id']]['market_size_total_'+area_id]+=(+type_data['market_size_total']);
                      rows[type_data['type_id']]['market_size_arm_'+area_id]+=(+type_data['market_size_arm']);
                      rows[type_data['type_id']]['market_size_competitor_'+area_id]+=(+type_data['market_size_competitor']);
                    }
                  }
                  rows[type_data['type_id']]['market_size_location_total']+=(+type_data['market_size_total']);
                }
                else{
                  for(let part_id in location_parts_object){
                    if(location_parts_object[part_id]['district_ids'].includes(type_data['district_id'])){
                      rows[type_data['type_id']]['market_size_total_'+part_id]+=(+type_data['market_size_total']);
                      rows[type_data['type_id']]['market_size_arm_'+part_id]+=(+type_data['market_size_arm']);
                      rows[type_data['type_id']]['market_size_competitor_'+part_id]+=(+type_data['market_size_competitor']);
                    }
                  }
                  rows[type_data['type_id']]['market_size_location_total']+=(+type_data['market_size_total']);
                }
              }
            }
          }
          else if(report_format=='crop_country_location'){
            columns_all.push({'group':'crop_name','key':'crop_name','label':labels.get('label_crop_name')})

            //arm and competitor total not showing or add future
            let location_id=0;
            let location_type='';
            let locations=[];
            if($('#upazila_id').val()>0){
              location_type='Upazila';
              location_id=$('#upazila_id').val();
              locations.push(location_upazilas_object[location_id]);
            }
            else if($('#district_id').val()>0){
              location_type='District';
              location_id=$('#district_id').val();
              for(let i in location_districts_object[location_id]['upazila_ids']){
                locations.push(location_upazilas_object[location_districts_object[location_id]['upazila_ids'][i]]);
              }
            }
            else if($('#division_id').val()>0){
              location_type='Division';
              location_id=$('#division_id').val();
              for(let i in location_divisions_object[location_id]['district_ids']){
                locations.push(location_districts_object[location_divisions_object[location_id]['district_ids'][i]]);
              }
            }
            else{
              location_type='National';
              locations=taskData.location_divisions;
            }
            columns_all.push({'group':'market_size_location_total','key':'market_size_location_total','label':'Total Market Size</br>('+location_type+')'})
            for(let index in locations){
              columns_all.push({'group':'market_size_total','key':'market_size_total_'+locations[index].id,'label':labels.get('label_market_size_total')+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'market_size_arm','key':'market_size_arm_'+locations[index].id,'label':labels.get('label_market_size_arm')+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'market_size_competitor','key':'market_size_competitor_'+locations[index].id,'label':labels.get('label_market_size_competitor')+'</br>('+locations[index].name+')'})
            }
            if(location_type=='District'){
              columns_all.push({'group':'market_size_total','key':'market_size_total_0','label':labels.get('label_market_size_total')+'</br>(other)'})
              columns_all.push({'group':'market_size_arm','key':'market_size_arm_0','label':labels.get('label_market_size_arm')+'</br>(other)'})
              columns_all.push({'group':'market_size_competitor','key':'market_size_competitor_0','label':labels.get('label_market_size_competitor')+'</br>(other)'})
            }
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
                rows[crop['id']]['market_size_location_total']=0;
                for(let index in locations){
                  rows[crop['id']]['market_size_total_'+locations[index].id]=0;
                  rows[crop['id']]['market_size_arm_'+locations[index].id]=0;
                  rows[crop['id']]['market_size_competitor_'+locations[index].id]=0;
                }
                if(location_type=='District'){
                  rows[crop['id']]['market_size_total_0']=0;
                  rows[crop['id']]['market_size_arm_0']=0;
                  rows[crop['id']]['market_size_competitor_0']=0;
                }
              }
            }
            for(let i in res.data.items){
              let type_data=res.data.items[i];
              if(rows[type_data['crop_id']])
              {
                if($('#upazila_id').val()>0){
                  let upazila_id=$('#upazila_id').val();
                  rows[type_data['crop_id']]['market_size_total_'+upazila_id]+=(+type_data['market_size_total']);//only this upazila data form api.no need to get individual size
                  rows[type_data['crop_id']]['market_size_location_total']+=(+type_data['market_size_total']);//only this upazila data form api.no need to get individual size

                }
                else if($('#district_id').val()>0){
                  let upazila_info=getUpazilaInfo(type_data)
                  let district_id=$('#district_id').val();
                  for(let upazila_id in upazila_info){
                    if(upazila_id==0 || (location_districts_object[district_id]['upazila_ids'].includes(+upazila_id))){//checking in case upazilla changed.
                      rows[type_data['crop_id']]['market_size_total_'+upazila_id]+=(+upazila_info[upazila_id]['upazila_market_size']);//only this upazila data form api.
                    }
                  }
                  rows[type_data['crop_id']]['market_size_location_total']+=(+type_data['market_size_total']);
                }
                else if($('#division_id').val()>0){
                  rows[type_data['crop_id']]['market_size_total_'+type_data['district_id']]+=(+type_data['market_size_total']);
                  rows[type_data['crop_id']]['market_size_arm_'+type_data['district_id']]+=(+type_data['market_size_arm']);
                  rows[type_data['crop_id']]['market_size_competitor_'+type_data['district_id']]+=(+type_data['market_size_competitor']);

                  rows[type_data['crop_id']]['market_size_location_total']+=(+type_data['market_size_total']);

                }
                else{
                  for(let division_id in location_divisions_object){
                    if(location_divisions_object[division_id]['district_ids'].includes(type_data['district_id'])){
                      rows[type_data['crop_id']]['market_size_total_'+division_id]+=(+type_data['market_size_total']);
                      rows[type_data['crop_id']]['market_size_arm_'+division_id]+=(+type_data['market_size_arm']);
                      rows[type_data['crop_id']]['market_size_competitor_'+division_id]+=(+type_data['market_size_competitor']);

                      rows[type_data['crop_id']]['market_size_location_total']+=(+type_data['market_size_total']);
                      break;
                    }
                  }
                }

              }
            }

          }
          else if(report_format=='type_country_location'){
            columns_all.push({'group':'crop_name','key':'crop_name','label':labels.get('label_crop_name')})
            columns_all.push({'group':'type_name','key':'type_name','label':labels.get('label_type_name')})

            //arm and competitor total not showing or add future
            let location_id=0;
            let location_type='';
            let locations=[];
            if($('#upazila_id').val()>0){
              location_type='Upazila';
              location_id=$('#upazila_id').val();
              locations.push(location_upazilas_object[location_id]);
            }
            else if($('#district_id').val()>0){
              location_type='District';
              location_id=$('#district_id').val();
              for(let i in location_districts_object[location_id]['upazila_ids']){
                locations.push(location_upazilas_object[location_districts_object[location_id]['upazila_ids'][i]]);
              }
            }
            else if($('#division_id').val()>0){
              location_type='Division';
              location_id=$('#division_id').val();
              for(let i in location_divisions_object[location_id]['district_ids']){
                locations.push(location_districts_object[location_divisions_object[location_id]['district_ids'][i]]);
              }
            }
            else{
              location_type='National';
              locations=taskData.location_divisions;
            }
            columns_all.push({'group':'market_size_location_total','key':'market_size_location_total','label':'Total Market Size</br>('+location_type+')'})
            for(let index in locations){
              columns_all.push({'group':'market_size_total','key':'market_size_total_'+locations[index].id,'label':labels.get('label_market_size_total')+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'market_size_arm','key':'market_size_arm_'+locations[index].id,'label':labels.get('label_market_size_arm')+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'market_size_competitor','key':'market_size_competitor_'+locations[index].id,'label':labels.get('label_market_size_competitor')+'</br>('+locations[index].name+')'})
            }
            if(location_type=='District'){
              columns_all.push({'group':'market_size_total','key':'market_size_total_0','label':labels.get('label_market_size_total')+'</br>(other)'})
              columns_all.push({'group':'market_size_arm','key':'market_size_arm_0','label':labels.get('label_market_size_arm')+'</br>(other)'})
              columns_all.push({'group':'market_size_competitor','key':'market_size_competitor_0','label':labels.get('label_market_size_competitor')+'</br>(other)'})
            }
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
                rows[crop_type['id']]['market_size_location_total']=0;
                for(let index in locations){
                  rows[crop_type['id']]['market_size_total_'+locations[index].id]=0;
                  rows[crop_type['id']]['market_size_arm_'+locations[index].id]=0;
                  rows[crop_type['id']]['market_size_competitor_'+locations[index].id]=0;
                }
                if(location_type=='District'){
                  rows[crop_type['id']]['market_size_total_0']=0;
                  rows[crop_type['id']]['market_size_arm_0']=0;
                  rows[crop_type['id']]['market_size_competitor_0']=0;
                }
              }
            }
            for(let i in res.data.items){
              let type_data=res.data.items[i];
              if(rows[type_data['type_id']])
              {
                if($('#upazila_id').val()>0){
                  let upazila_id=$('#upazila_id').val();
                  rows[type_data['type_id']]['market_size_total_'+upazila_id]+=(+type_data['market_size_total']);//only this upazila data form api.no need to get individual size
                  rows[type_data['type_id']]['market_size_location_total']+=(+type_data['market_size_total']);//only this upazila data form api.no need to get individual size

                }
                else if($('#district_id').val()>0){
                  let upazila_info=getUpazilaInfo(type_data)
                  let district_id=$('#district_id').val();
                  for(let upazila_id in upazila_info){
                    if(upazila_id==0 || (location_districts_object[district_id]['upazila_ids'].includes(+upazila_id))){//checking in case upazilla changed.
                      rows[type_data['type_id']]['market_size_total_'+upazila_id]+=(+upazila_info[upazila_id]['upazila_market_size']);//only this upazila data form api.
                    }
                  }
                  rows[type_data['type_id']]['market_size_location_total']+=(+type_data['market_size_total']);
                }
                else if($('#division_id').val()>0){
                  rows[type_data['type_id']]['market_size_total_'+type_data['district_id']]+=(+type_data['market_size_total']);
                  rows[type_data['type_id']]['market_size_arm_'+type_data['district_id']]+=(+type_data['market_size_arm']);
                  rows[type_data['type_id']]['market_size_competitor_'+type_data['district_id']]+=(+type_data['market_size_competitor']);

                  rows[type_data['type_id']]['market_size_location_total']+=(+type_data['market_size_total']);

                }
                else{
                  for(let division_id in location_divisions_object){
                    if(location_divisions_object[division_id]['district_ids'].includes(type_data['district_id'])){
                      rows[type_data['type_id']]['market_size_total_'+division_id]+=(+type_data['market_size_total']);
                      rows[type_data['type_id']]['market_size_arm_'+division_id]+=(+type_data['market_size_arm']);
                      rows[type_data['type_id']]['market_size_competitor_'+division_id]+=(+type_data['market_size_competitor']);

                      rows[type_data['type_id']]['market_size_location_total']+=(+type_data['market_size_total']);
                      break;
                    }
                  }
                }

              }
            }

          }

          taskData.itemsFiltered=Object.values(rows);
          taskData.columns.all=columns_all;
          calculateTableWidth();
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
        show_report.value=false;
        let report_format=$(this).val();
        let columns_selectable=[];
        let columns_hidden=[]
        if(report_format=='crop_marketsize'){
          columns_selectable=['market_size_total','market_size_arm','market_size_competitor','competitor_variety','competitor_variety_market_size','competitor_variety_sales_reason','sowing_periods','upazila_name','upazila_market_size','unions_name'];
          columns_hidden=['competitor_variety','competitor_variety_market_size','competitor_variety_sales_reason','sowing_periods','upazila_name','upazila_market_size','unions_name'];

        }
        else if(report_format=='type_marketsize'){
          columns_selectable=['market_size_total','market_size_arm','market_size_competitor','price_approximate','competitor_variety','competitor_variety_market_size','competitor_variety_sales_reason','sowing_periods','upazila_name','upazila_market_size','unions_name'];
          columns_hidden=['competitor_variety','competitor_variety_market_size','competitor_variety_sales_reason','sowing_periods','upazila_name','upazila_market_size','unions_name'];
        }
        else if((report_format=='crop_arm_location')||(report_format=='type_arm_location') || (report_format=='crop_country_location' )|| (report_format=='type_country_location' )){
          columns_selectable=['market_size_location_total','market_size_total','market_size_arm','market_size_competitor'];
          columns_hidden=['market_size_arm','market_size_competitor'];
        }
        taskData.columns.selectable=columns_selectable;
        taskData.columns.hidden=columns_hidden;
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
      let width=0;
      for(let index in taskData.columns.all){
        if(taskData.columns.hidden.indexOf(taskData.columns.all[index].group)<0){
          width+=150;
        }
      }
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