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
      <div id="label_action_8" class="collapse" v-if="item.exists">
        <div class="card-body">
          <div class="row">
            <template v-for="column in taskData.columns.selectable2">
              <div class="col-sm-4 col-md-2">
                <label><input :class="'column_control '+column" type="checkbox" :value="column" @change="toggleReportControlColumns($event)"> {{labels.get('label_'+column)}}</label>
              </div>
            </template>
          </div>
          <div class="row">
            <template v-for="column in taskData.columns.selectable1">
              <div class="col-sm-4 col-md-2">
                <label><input :class="'column_control '+column" type="checkbox" :value="column" @change="toggleReportControlColumns($event)"> {{labels.get('label_'+column)}}</label>
              </div>
            </template>
          </div>
          <div class="row">
            <template v-for="column in taskData.columns.selectable3">
              <div class="col-sm-4 col-md-2">
                <label><input :class="'column_control '+column" type="checkbox" :value="column" @change="toggleReportControlColumns($event)"> {{labels.get('label_'+column)}}</label>
              </div>
            </template>
          </div>
        </div>

      </div>
    </div>

  </div>
  <div class="card" v-if="show_report">
    <div class="card-body pb-0 d-print-none">
      <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" onclick="window.print();"><i class="feather icon-printer"></i> {{labels.get('action_4')}}</button>
      <button type="button" v-if="taskData.permissions.action_5" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="exportCsv"><i class="feather icon-download"></i> {{labels.get('action_5')}}</button>
      <button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="showHtmlContentInNewWindow"><i class="feather icon-maximize-2"></i> {{labels.get('action_show_in_new_window')}}</button>
    </div>
    <div class="card-body" style='overflow-x:auto;height:600px;padding: 0'>
      <table id="table_report" :style="'width: '+table_width+'px'" class="table table-bordered sticky">
        <thead class="table-active">
        <tr>
          <template v-for="(column,key) in taskData.columns.all">
            <th :style="'width: '+(column.width?column.width:150)+'px;'" v-if="taskData.columns.hidden.indexOf(column.group)<0" :key="'th_'+key">
              <div v-html="column.label"></div>
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
        <template v-for="row in taskData.itemsFiltered">
          <tr v-for="index  in row['num_rows']" >
            <template v-for="(column,key) in taskData.columns.all">
              <td :class="((['crop_name','type_name','variety_name'].indexOf(column.group) == -1)?'text-right':'')" v-if="taskData.columns.hidden.indexOf(column.group)<0">
                <template v-if="index==1">
                  <template v-if="(['unit_price','amount_target','amount_sales_net','amount_sales_gross','amount_sales_cancel','amount_difference'].indexOf(column.group) != -1)">{{ row[column.key]?row[column.key].toFixed(2):'' }}</template>
                  <template v-else-if="(['quantity_target','quantity_sales_net','quantity_sales_gross','quantity_sales_cancel','quantity_difference'].indexOf(column.group) != -1)">{{ row[column.key]?row[column.key].toFixed(3):'' }}</template>
                  <template v-else-if="(['achievement'].indexOf(column.group) != -1)">{{ row[column.key]?row[column.key].toFixed(2)+'%':'' }}</template>
                  <template v-else>{{ row[column.key] }}</template>
                </template>
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
      let part_id=taskData.location_parts[i]['id'];
      location_parts_object[part_id]=taskData.location_parts[i];
    }
    let location_areas_object={};
    for(let i in taskData.location_areas){
      let area_id=taskData.location_areas[i]['id'];
      location_areas_object[area_id]=taskData.location_areas[i];
    }
    let location_territories_object={};
    for(let i in taskData.location_territories){
      let territory_id=taskData.location_territories[i]['id'];
      location_territories_object[territory_id]=taskData.location_territories[i];
    }
    let distributors_object={};
    for(let i in taskData.distributors){
      let distributor_id=taskData.distributors[i]['id'];
      distributors_object[distributor_id]=taskData.distributors[i];
    }
    let dealers_object={};
    for(let i in taskData.dealers){
      let dealer_id=taskData.dealers[i]['id'];
      dealers_object[dealer_id]=taskData.dealers[i];
    }

    const setInputFields=async ()=>{
      item.inputFields1= {};
      item.inputFields2= {};
      item.inputFields3= {};
      await systemFunctions.delay(1);
      let inputFields={}
      let key='report_format';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[
            {value:'crop',label:'Crop Wise'},{value:'type',label:'Type Wise'},{value:'variety',label:'Variety Wise'},
          {value:'crop_arm_location',label:'Malik Zoning (Crop)'},{value:'type_arm_location',label:'Malik Zoning (Type)'},{value:'variety_arm_location',label:'Malik Zoning (Variety)'},
        ],
        default:'variety',
        mandatory:true,
        noselect:true,
      };
      key='fiscal_year';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:new Array(globalVariables.current_fiscal_year-globalVariables.sales_starting_year+1).fill().map((temp,index) => {return {value:globalVariables.current_fiscal_year-index,label:(globalVariables.current_fiscal_year-index)+' - '+(globalVariables.current_fiscal_year-index+1)}}),
        default:globalVariables.current_fiscal_year,
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
        options:taskData.location_parts.filter((temp)=>{ if(temp.status=='Active'){temp.value=temp.id.toString();temp.label=temp.name;return true}}),
        default:item.data[key],
        mandatory:false
      };
      if(taskData.user_locations.part_id>0){
        inputFields[key] = {
          name: 'options[' +key +']',
          label: labels.get('label_'+key),
          type:'hidden',
          default:taskData.user_locations.part_id,
          mandatory:true
        };
        key='part_name';
        inputFields[key] = {
          name: key,
          label: labels.get('label_'+key),
          type:'textonly',
          default: location_parts_object[taskData.user_locations.part_id]['name'],
          mandatory:false
        };
      }
      key='area_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:(taskData.user_locations.part_id>0)?taskData.location_areas.filter((temp)=>{ if((temp.part_id==taskData.user_locations.part_id)&&(temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
        default:item.data[key],
        mandatory:false
      };
      if(taskData.user_locations.area_id>0){
        inputFields[key] = {
          name: 'options[' +key +']',
          label: labels.get('label_'+key),
          type:'hidden',
          default:taskData.user_locations.area_id,
          mandatory:true
        };
        key='area_name';
        inputFields[key] = {
          name: key,
          label: labels.get('label_'+key),
          type:'textonly',
          default: location_areas_object[taskData.user_locations.area_id]['name'],
          mandatory:false
        };
      }
      key='territory_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:(taskData.user_locations.area_id>0)?taskData.location_territories.filter((temp)=>{ if((temp.area_id==taskData.user_locations.area_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
        default:item.data[key],
        mandatory:false
      };
      if(taskData.user_locations.territory_id>0){
        inputFields[key] = {
          name: 'options[' +key +']',
          label: labels.get('label_'+key),
          type:'hidden',
          default:taskData.user_locations.territory_id,
          mandatory:true
        };
        key='territory_name';
        inputFields[key] = {
          name: key,
          label: labels.get('label_'+key),
          type:'textonly',
          default: location_territories_object[taskData.user_locations.territory_id]['name'],
          mandatory:false
        };
      }
      key='distributor_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:(taskData.user_locations.territory_id>0)?taskData.distributors.filter((temp)=>{ if((temp.territory_id==taskData.user_locations.territory_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
        default:item.data[key],
        mandatory:false
      };
      key='dealer_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[],
        default:'',
        mandatory:false
      };


      item.inputFields2=inputFields;
      //inputFields3
      inputFields={}
      key='crop_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.crops.filter((temp)=>{ if(temp.status=='Active'){temp.value=temp.id.toString();temp.label=temp.name;return true}}),
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
      key='variety_id';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[],
        default:item.data[key],
        mandatory:true
      };
      key='status';
      inputFields[key] = {
        name: 'options[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[{label:"All",value:'All'},{label:"Active",value:'Active'},{label:"In-Active",value:'In-Active'}],
        default:'Active',
        mandatory:true,
        noselect:true,
      };
      item.inputFields3=inputFields;



      await systemFunctions.delay(1);
      item.exists=true;
      await systemFunctions.delay(1);
      $('.input_container div').removeClass('col-lg-4')//to fix size

    }
    const search=async ()=>{
      show_report.value=false;
      let options={};
      $('#formSearch :input').each(function() {
        options[$(this).attr('id')]=$(this).val();
      });
      let formData=new FormData(document.getElementById('formSearch'))
      await axios.post(taskData.api_url+'/get-items',formData).then((res)=>{
        if (res.data.error == "") {
          taskData.itemsFiltered=[];
          let columns_all=[];
          let rows={};
          let rows_array=[];
          // {value:'crop',label:'Crop Wise'},{value:'type',label:'Type Wise'},{value:'variety',label:'Variety Wise'},
          // {value:'crop_arm_location',label:'Malik Zoning (Crop)'},{value:'type_arm_location',label:'Malik Zoning (Type)'},{value:'variety_arm_location',label:'Malik Zoning (Variety)'},

          let location_type='';
          let location_id=0;
          let locations=[];

          columns_all.push({'group':'crop_name','key':'crop_name','label':labels.get('label_crop_name')})
          if((options['report_format']=='type')||(options['report_format']=='variety')||(options['report_format']=='type_arm_location')||(options['report_format']=='variety_arm_location')){
            columns_all.push({'group':'type_name','key':'type_name','label':labels.get('label_type_name')})
            if((options['report_format']=='variety')||(options['report_format']=='variety_arm_location')){
              columns_all.push({'group':'variety_name','key':'variety_name','label':labels.get('label_variety_name')})
            }
          }
          if((options['report_format']=='variety') || (options['report_format']=='variety_arm_location')) {
            columns_all.push({'group': 'unit_price', 'key': 'unit_price', 'label': labels.get('label_unit_price')})
          }
          if((options['report_format']=='type')||(options['report_format']=='variety')||(options['report_format']=='crop')){

            columns_all.push({'group':'quantity_target','key':'quantity_target','label':labels.get('label_quantity')+'</br>(target)'})
            columns_all.push({'group':'amount_target','key':'amount_target','label':labels.get('label_amount')+'</br>(target)'})

            columns_all.push({'group':'quantity_sales_gross','key':'quantity_sales_gross','label':labels.get('label_quantity')+'</br>(Gross sales)'})
            columns_all.push({'group':'amount_sales_gross','key':'amount_sales_gross','label':labels.get('label_amount')+'</br>(Gross sales)'})
            columns_all.push({'group':'quantity_sales_cancel','key':'quantity_sales_cancel','label':labels.get('label_quantity')+'</br>(Canceled sales)'})
            columns_all.push({'group':'amount_sales_cancel','key':'amount_sales_cancel','label':labels.get('label_amount')+'</br>(Canceled sales)'})
            columns_all.push({'group':'quantity_sales_net','key':'quantity_sales_net','label':labels.get('label_quantity')+'</br>(Net sales)'})
            columns_all.push({'group':'amount_sales_net','key':'amount_sales_net','label':labels.get('label_amount')+'</br>(Net sales)'})
            columns_all.push({'group':'quantity_difference','key':'quantity_difference','label':labels.get('label_quantity')+'</br>(Difference)'})
            columns_all.push({'group':'amount_difference','key':'amount_difference','label':labels.get('label_amount')+'</br>(Difference)'})
            columns_all.push({'group':'achievement','key':'achievement','label':labels.get('label_achievement')})
          }
          //((options['report_format']=='crop_arm_location')||(options['report_format']=='type_arm_location')||(options['report_format']=='variety_arm_location'))
          else {
            if(options['dealer_id']>0){
              location_type='Dealer';
              location_id=options['dealer_id'];
              locations.push(dealers_object[location_id]);
            }
            else if(options['distributor_id']>0){
              location_type='Distributor';
              location_id=options['distributor_id'];
              locations=taskData.dealers.filter((temp)=>{ if(temp.distributor_id==location_id){return true}})
            }
            else if(options['territory_id']>0){
              location_type='Territory';
              location_id=options['territory_id'];
              locations=taskData.distributors.filter((temp)=>{ if(temp.territory_id==location_id){return true}})
            }
            else if(options['area_id']>0){
              location_type='Area';
              location_id=options['area_id'];
              locations=taskData.location_territories.filter((temp)=>{ if(temp.area_id==location_id){return true}})
            }
            else if(options['part_id']>0){
              location_type='Part';
              location_id=options['part_id'];
              locations=taskData.location_areas.filter((temp)=>{ if(temp.part_id==location_id){return true}})
            }
            else{
              location_type='National';
              locations=taskData.location_parts;
            }

            for(let index in locations){
              columns_all.push({'group':'quantity_target','key':'quantity_target_'+locations[index].id,'label':labels.get('label_quantity')+'</br>(target)'+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'amount_target','key':'amount_target_'+locations[index].id,'label':labels.get('label_amount')+'</br>(target)'+'</br>('+locations[index].name+')'})

              columns_all.push({'group':'quantity_sales_gross','key':'quantity_sales_gross_'+locations[index].id,'label':labels.get('label_quantity')+'</br>(Gross sales)'+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'amount_sales_gross','key':'amount_sales_gross_'+locations[index].id,'label':labels.get('label_amount')+'</br>(Gross sales)'+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'quantity_sales_cancel','key':'quantity_sales_cancel_'+locations[index].id,'label':labels.get('label_quantity')+'</br>(Canceled sales)'+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'amount_sales_cancel','key':'amount_sales_cancel_'+locations[index].id,'label':labels.get('label_amount')+'</br>(Canceled sales)'+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'quantity_sales_net','key':'quantity_sales_net_'+locations[index].id,'label':labels.get('label_quantity')+'</br>(Net sales)'+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'amount_sales_net','key':'amount_sales_net_'+locations[index].id,'label':labels.get('label_amount')+'</br>(Net sales)'+'</br>('+locations[index].name+')'})

              columns_all.push({'group':'quantity_difference','key':'quantity_difference_'+locations[index].id,'label':labels.get('label_quantity')+'</br>(Difference)'+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'amount_difference','key':'amount_difference_'+locations[index].id,'label':labels.get('label_amount')+'</br>(Difference)'+'</br>('+locations[index].name+')'})
              columns_all.push({'group':'achievement','key':'achievement_'+locations[index].id,'label':labels.get('label_achievement')+'</br>('+locations[index].name+')'})
            }
          }
          if((options['report_format']=='crop')||(options['report_format']=='crop_arm_location')){
            for(let i in taskData.crops){
              let crop=taskData.crops[i];
              if(options['status']!='All' && crop['status']!=options['status'])
                continue;
              if(options['crop_id']>0){
                if(options['crop_id']!=crop['id']){
                  continue;
                }
              }
              rows[crop['id']]={}
              rows[crop['id']]['id']=crop['id'];
              rows[crop['id']]['num_rows']=1;
              rows[crop['id']]['crop_name']=crop['name'];
              rows_array.push(rows[crop['id']])//for ordering
            }
          }
          else if((options['report_format']=='type')||(options['report_format']=='type_arm_location')){
            for(let i in taskData.crop_types){
              let crop_type=taskData.crop_types[i];
              if(options['status']!='All' && crop_type['status']!=options['status'])
                continue;
              if(options['crop_id']>0){
                if(options['crop_type_id']>0){
                  if(options['crop_type_id']!=crop_type['crop_type_id']){
                    continue;
                  }
                }
                else if(options['crop_id']!=crop_type['crop_id']){
                  continue;
                }
              }
              rows[crop_type['id']]={}
              rows[crop_type['id']]['id']=crop_type['id'];
              rows[crop_type['id']]['num_rows']=1;
              rows[crop_type['id']]['crop_name']=crop_type['crop_name'];
              rows[crop_type['id']]['type_name']=crop_type['name'];
              rows_array.push(rows[crop_type['id']])//for ordering
            }
          }
          else if((options['report_format']=='variety')||(options['report_format']=='variety_arm_location')){
            for(let i in taskData.varieties){
              let variety=taskData.varieties[i];
              if(options['status']!='All' && variety['status']!=options['status'])
                continue;
              if(variety['whose']!='ARM')
                continue;
              if(options['crop_id']>0){
                if(options['crop_type_id']>0){
                  if(options['variety_id']>0){
                    if(options['variety_id']!=variety['id']){
                      continue;
                    }
                  }
                  else if(options['crop_type_id']!=variety['crop_type_id']){
                    continue;
                  }
                }
                else if(options['crop_id']!=variety['crop_id']){
                  continue;
                }
              }
              rows[variety['id']]={}
              rows[variety['id']]['id']=variety['id'];
              rows[variety['id']]['num_rows']=1;
              rows[variety['id']]['crop_name']=variety['crop_name'];
              rows[variety['id']]['type_name']=variety['crop_type_name'];
              rows[variety['id']]['variety_name']=variety['name'];
              rows_array.push(rows[variety['id']])//for ordering
            }
          }
          for(let id in rows){
            for(let index in columns_all)
            {
              let group=columns_all[index]['group'];
              if(['crop_name','type_name','variety_name'].indexOf(group) == -1){
                rows[id][columns_all[index]['key']]=0;
              }
            }
          }
          //res.data.varieties_sales_target
          //console.log(res.data.sales_targets)
          for(let variety_id in res.data.sales_targets){
            let row_key=0;
            if((options['report_format']=='variety') || (options['report_format']=='variety_arm_location')){
              row_key=variety_id;
            }
            else if((options['report_format']=='type')||(options['report_format']=='type_arm_location')){
              row_key=varieties_object[variety_id]?varieties_object[variety_id]['crop_type_id']:0;
            }
            else if((options['report_format']=='crop')||(options['report_format']=='crop_arm_location')){
              row_key=varieties_object[variety_id]?(crop_types_object[varieties_object[variety_id]['crop_type_id']]?crop_types_object[varieties_object[variety_id]['crop_type_id']]['crop_id']:0):0;
            }
            let variety_data=res.data.sales_targets[variety_id];
            if(rows[row_key]) {
              if((options['report_format']=='variety') || (options['report_format']=='variety_arm_location')){
                rows[row_key]['unit_price'] = (+variety_data['unit_price'])
              }
              for(let dealer_id in variety_data['dealers']){
                let dealers_data=variety_data['dealers'][dealer_id];
                if((options['report_format']=='variety')||(options['report_format']=='type')||(options['report_format']=='crop'))
                {
                  rows[row_key]['quantity_target']+=(+dealers_data['quantity_target']);
                  rows[row_key]['amount_target']+=(+dealers_data['amount_target']);
                  rows[row_key]['quantity_sales_gross']+=(+dealers_data['quantity_sales_gross']);
                  rows[row_key]['amount_sales_gross']+=(+dealers_data['amount_sales_gross']);
                  rows[row_key]['quantity_sales_cancel']+=(+dealers_data['quantity_sales_cancel']);
                  rows[row_key]['amount_sales_cancel']+=(+dealers_data['amount_sales_cancel']);
                }
                else
                {
                  let column_key=0;
                  if(location_type=='Dealer'){
                    column_key=dealer_id;
                  }
                  else if(location_type=='Distributor'){
                    column_key=dealer_id;
                  }
                  else if(location_type=='Territory'){
                    column_key=dealers_object[dealer_id]?dealers_object[dealer_id]['distributor_id']:0;
                  }
                  else if(location_type=='Area'){
                    let distributor_id=dealers_object[dealer_id]?dealers_object[dealer_id]['distributor_id']:0;
                    column_key=distributors_object[distributor_id]?distributors_object[distributor_id]['territory_id']:0;
                  }
                  else if(location_type=='Part'){
                    let distributor_id=dealers_object[dealer_id]?dealers_object[dealer_id]['distributor_id']:0;
                    let territory_id=distributors_object[distributor_id]?distributors_object[distributor_id]['territory_id']:0;
                    column_key=location_territories_object[territory_id]?location_territories_object[territory_id]['area_id']:0;
                  }
                  else if(location_type=='National'){
                    let distributor_id=dealers_object[dealer_id]?dealers_object[dealer_id]['distributor_id']:0;
                    let territory_id=distributors_object[distributor_id]?distributors_object[distributor_id]['territory_id']:0;
                    let area_id=location_territories_object[territory_id]?location_territories_object[territory_id]['area_id']:0;
                    column_key=location_areas_object[area_id]?location_areas_object[area_id]['part_id']:0;
                  }
                  if(column_key>0){
                    rows[row_key]['quantity_target_'+column_key]+=(+dealers_data['quantity_target']);
                    rows[row_key]['amount_target_'+column_key]+=(+dealers_data['amount_target']);
                    rows[row_key]['quantity_sales_gross_'+column_key]+=(+dealers_data['quantity_sales_gross']);
                    rows[row_key]['amount_sales_gross_'+column_key]+=(+dealers_data['amount_sales_gross']);
                    rows[row_key]['quantity_sales_cancel_'+column_key]+=(+dealers_data['quantity_sales_cancel']);
                    rows[row_key]['amount_sales_cancel_'+column_key]+=(+dealers_data['amount_sales_cancel']);
                  }
                }
              }
            }
          }
          let row_total={}
          row_total['id']=0;
          row_total['num_rows']=1;
          for(let index in columns_all)
          {
            row_total[columns_all[index]['key']]=((['crop_name','type_name','variety_name'].indexOf(columns_all[index]['group']) != -1)?'':0)
          }
          row_total['crop_name']='Grand Total';
          //For ordering
          for(let i in rows_array){
            let row=rows[rows_array[i]['id']];
            if((options['report_format']=='variety')||(options['report_format']=='type')||(options['report_format']=='crop')){
              row['quantity_sales_net']=row['quantity_sales_gross']-row['quantity_sales_cancel'];
              row['amount_sales_net']=row['amount_sales_gross']-row['amount_sales_cancel'];
              row['quantity_difference']=row['quantity_target']-row['quantity_sales_net'];
              row['amount_difference']=row['amount_target']-row['amount_sales_net'];
              if(row['quantity_target']>0){
                row['achievement']=(row['quantity_sales_net']*100/row['quantity_target']);
              }
              row_total['amount_target']+=row['amount_target'];
              row_total['amount_sales_gross']+=row['amount_sales_gross'];
              row_total['amount_sales_cancel']+=row['amount_sales_cancel'];
              row_total['amount_sales_net']+=row['amount_sales_net'];
              row_total['amount_difference']=row_total['amount_target']-row_total['amount_sales_net'];
              if(row_total['amount_target']>0){
                row_total['achievement']=(row_total['amount_sales_net']*100/row_total['amount_target']);
              }
            }
            else{
              for(let index in locations){
                let location_id=locations[index].id;
                row['quantity_sales_net_'+location_id]=row['quantity_sales_gross_'+location_id]-row['quantity_sales_cancel_'+location_id];
                row['amount_sales_net_'+location_id]=row['amount_sales_gross_'+location_id]-row['amount_sales_cancel_'+location_id];
                row['quantity_difference_'+location_id]=row['quantity_target_'+location_id]-row['quantity_sales_net_'+location_id];
                row['amount_difference_'+location_id]=row['amount_target_'+location_id]-row['amount_sales_net_'+location_id];
                if(row['quantity_target_'+location_id]>0){
                  row['achievement_'+location_id]=(row['quantity_sales_net_'+location_id]*100/row['quantity_target_'+location_id]);
                }
                row_total['amount_target_'+location_id]+=row['amount_target_'+location_id];
                row_total['amount_sales_gross_'+location_id]+=row['amount_sales_gross_'+location_id];
                row_total['amount_sales_cancel_'+location_id]+=row['amount_sales_cancel_'+location_id];
                row_total['amount_sales_net_'+location_id]+=row['amount_sales_net_'+location_id];
                row_total['amount_difference_'+location_id]=row_total['amount_target_'+location_id]-row_total['amount_sales_net_'+location_id];
                if(row_total['amount_target_'+location_id]>0){
                  row_total['achievement_'+location_id]=(row_total['amount_sales_net_'+location_id]*100/row_total['amount_target_'+location_id]);
                }
              }
            }
            rows_array[i]=row;
          }
          rows_array.unshift(row_total)
          taskData.itemsFiltered=rows_array;
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
      systemFunctions.exportCsvFromHtmlTable('#table_report',labels.get('label_task'))
    }
    const showHtmlContentInNewWindow=async ()=>{
      systemFunctions.showHtmlContentInNewWindow('<table>'+$('#table_report').html()+'</table>',labels.get('label_task'))

    }
    const toggleReportControlColumns=(event)=>{
      //show_report.value=false;
      let hiddenColumns=[]
      for(let i in taskData.columns.selectable2){
        let column2=taskData.columns.selectable2[i];
        let checked=$('.column_control.'+column2).is(':checked');
        if(!checked){
          for(let j in taskData.columns.selectable1){
            let column1=taskData.columns.selectable1[j]
            hiddenColumns.push(column1+'_'+column2)
          }
        }
      }
      for(let i in taskData.columns.selectable1){
        let column1=taskData.columns.selectable1[i];
        let checked=$('.column_control.'+column1).is(':checked');
        if(!checked){
          for(let j in taskData.columns.selectable2){
            let column2=taskData.columns.selectable2[j]
            if(hiddenColumns.indexOf((column1+'_'+column2))==-1){
              hiddenColumns.push(column1+'_'+column2)
            }
          }
        }
      }
      if(!$('.column_control.unit_price').is(':checked')){
        hiddenColumns.push('unit_price')
      }
      if(!$('.column_control.achievement').is(':checked')){
        hiddenColumns.push('achievement')
      }
      taskData.columns.hidden=hiddenColumns
      calculateTableWidth();
    }
    const calculateTableWidth=()=>{
      table_width.value=systemFunctions.calculateReportTableWidth(taskData.columns);
    }
    setInputFields();
    $(document).ready(async function()
    {
      taskData.columns.selectable2=['target','sales_gross','sales_cancel','sales_net','difference'];
      taskData.columns.selectable1=['quantity','amount'];
      taskData.columns.selectable3=['unit_price','achievement'];
      taskData.columns.hidden=[];
      $(document).off("change", "#report_format");
      await systemFunctions.delay(20);
      //$('.column_control').prop('checked',true)
      $('.column_control.target').prop('checked',true)
      $('.column_control.sales_net').prop('checked',true)
      $('.column_control.quantity').prop('checked',true)
      $('.column_control.achievement').prop('checked',true)
      //$('.column_control.unit_price').prop('checked',true)
      toggleReportControlColumns();

      $(document).off("change", "#crop_id");
      $(document).on("change",'#crop_id',async function()
      {
        let crop_id=$(this).val();
        let key='crop_type_id';
        item.inputFields3[key].options=taskData.crop_types.filter((temp)=>{ if((temp.crop_id==crop_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='variety_id';
        item.inputFields3[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#crop_type_id");
      $(document).on("change",'#crop_type_id',async function()
      {
        let crop_type_id=$(this).val();
        let key='variety_id';
        item.inputFields3[key].options=taskData.varieties.filter((temp)=>{ if((temp.crop_type_id==crop_type_id) && (temp.whose=='ARM') && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
      })



      $(document).off("change", "#part_id");
      $(document).on("change",'#part_id',async function()
      {
        let part_id=$(this).val();
        let key='area_id';
        item.inputFields2[key].options=taskData.location_areas.filter((temp)=>{ if((temp.part_id==part_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='territory_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');
        key='distributor_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');
        key='dealer_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#area_id");
      $(document).on("change",'#area_id',async function()
      {
        let area_id=$(this).val();
        let key='territory_id';
        item.inputFields2[key].options=taskData.location_territories.filter((temp)=>{ if((temp.area_id==area_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='distributor_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');
        key='dealer_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#territory_id");
      $(document).on("change",'#territory_id',async function()
      {
        let territory_id=$(this).val();
        let key='distributor_id';
        item.inputFields2[key].options=taskData.distributors.filter((temp)=>{ if((temp.territory_id==territory_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
        key='dealer_id';
        item.inputFields2[key].options=[];
        $('#'+key).val('');
      })
      $(document).off("change", "#distributor_id");
      $(document).on("change",'#distributor_id',async function()
      {
        let distributor_id=$(this).val();
        let key='dealer_id';
        item.inputFields2[key].options=taskData.dealers.filter((temp)=>{ if((temp.distributor_id==distributor_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
        await systemFunctions.delay(1);
        $('#'+key).val('');
      })

    });

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