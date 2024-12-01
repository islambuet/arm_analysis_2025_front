<template>
  <div class="card d-print-none mb-2">
    <div class="card-header d-print-none">
      {{taskData.cropInfo.name}}-{{taskData.reportInfo.name}}
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-6">
          <div class="row mb-2">
            <div class="col-6">
              <label class="font-weight-bold float-right">{{labels.get('label_year')}} <span class="text-danger">*</span></label>
            </div>
            <div class="col-6">
              <div class="input-group" >
                <select id="year" class="form-control">
                  <option v-for="i in (globalVariables.current_year+2-globalVariables.starting_year)" :value="i+globalVariables.starting_year-1" :selected="(i+globalVariables.starting_year-1)==taskData.year">
                    {{i+globalVariables.starting_year-1}}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-6">
              <label class="font-weight-bold float-right">{{labels.get('label_trial_station')}} <span class="text-danger">*</span></label>
            </div>
            <div class="col-6">
              <div class="input-group" >
                <select id="trial_station_id" class="form-control">
                  <option v-for="trial_station in taskData.trial_stations" :value="trial_station.id" :selected="trial_station.id==taskData.trial_station_id">
                    {{trial_station.name}}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-6">
              <label class="font-weight-bold float-right">{{labels.get('label_season')}} <span class="text-danger">*</span></label>
            </div>
            <div class="col-6">
              <div class="input-group" >
                <select id="season_id" class="form-control">
                  <option value="0">{{labels.get('label_select')}}</option>
                  <option v-for="season in taskData.seasons" :value="season.id" :selected="season.id==taskData.season_id">
                    {{season.name}}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="card-header d-print-none pl-0">
            <div class="form-check">
              <input class="form-check-input select_all" type="checkbox" :data-type="'select_varieties'">
              <label class="form-check-label">
                {{ labels.get('Select All Varieties') }}
              </label>
            </div>
          </div>
          <form id="formSearch">
            <div class="form-check" v-for="variety in taskData.varieties">
              <label class="form-check-label">
                <input class="form-check-input select_varieties" name="variety_ids[]" type="checkbox" :value="variety.variety_id">
                {{variety.rnd_code}}
              </label>
            </div>
          </form>
          <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="search"><i class="feather icon-save"></i> {{labels.get('label_search')}}</button>
        </div>
      </div>

    </div>
  </div>
  <div class="card" v-if="show_report">
    <div class="card-body pb-0 d-print-none">
      <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" onclick="window.print();"><i class="feather icon-printer"></i> {{labels.get('action_4')}}</button>
      <button type="button" v-if="taskData.permissions.action_5" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="exportCsv"><i class="feather icon-download"></i> {{labels.get('action_5')}}</button>
    </div>
    <div class="card-body" style="overflow-x: auto; height: 600px;">
      <table class="table table-bordered">
        <thead class="table-active">
        <tr>
          <th class="align-middle text-center" rowspan="2">Rnd code</th>
          <th v-for="field in taskData.reportFields" :rowspan="field.max_entry_no>1?1:2" class="align-middle text-center" :colspan="field.max_entry_no">
            {{field.label}}
          </th>
        </tr>
        <tr>
          <template v-for="field in taskData.reportFields" >
            <th v-for="index in field.max_entry_no" class="align-middle text-center" v-if="field.max_entry_no>1" >{{index}}</th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
          <tr v-for="item in taskData.itemsFiltered">
            <td><div style="min-width: 110px;">{{item.rnd_code}}</div></td>
            <template v-for="field in taskData.reportFields" >
              <td v-for="index in field.max_entry_no" :class="((['number'].indexOf(field.type) != -1)?'text-right':'')" >
                <div style="width: 200px;max-height:200px" v-if="(['image'].indexOf(field.type) != -1)">
                  <img v-if="item[field.index+'_'+index]" style="max-width: 100%;max-height:200px" :src="systemFunctions.getImageUrl(item[field.index+'_'+index])">
                </div>
                <div style="min-width: 110px;" v-else-if="(['checkbox'].indexOf(field.type) != -1)">
                  <template v-if="typeof item[field.index+'_'+index]=='object'">
                    <div v-for="option in item[field.index+'_'+index]"><i class="bi bi-cursor-fill"></i>{{ option }}</div>
                  </template>
                </div>
                <div style="min-width: 110px;" v-else-if="(['features'].indexOf(field.type) != -1)">
                  <template v-if="typeof item[field.index+'_'+index]=='object'">
                    <div v-for="feature_id in item[field.index+'_'+index]"><i class="bi bi-cursor-fill"></i>{{ taskData.crop_features[feature_id]?taskData.crop_features[feature_id].name:'' }}</div>
                  </template>
                </div>
                <div style="min-width: 110px;" v-else-if="(['url'].indexOf(field.type) != -1)">
                  <a class="btn btn-sm bg-gradient-primary" target="_blank" v-if="item[field.index+'_'+index]" :href="(((item[field.index+'_'+index].startsWith('https://'))||(item[field.index+'_'+index].startsWith('http://')))?'':'http://')+item[field.index+'_'+index]">Visit URL</a>
                </div>
                <div style="min-width: 110px;" v-else>{{item[field.index+'_'+index]}}</div>
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
    import toastFunctions from "@/assets/toastFunctions";

    const router =useRouter()
    let taskData = inject('taskData')
    let show_report=ref(false)
    const exportCsv=async ()=>{
      let csvStr="";
      csvStr=csvStr+'"Rnd Code",';
      for(let  key in taskData.reportFields){
        let field=taskData.reportFields[key];

        for(let  k=1;k<=field.max_entry_no;k++){
          if(field.max_entry_no>1){
            csvStr=csvStr+'"'+field['label']+'('+k+')'+'",';
          }
          else {
            csvStr=csvStr+'"'+field['label']+'",';
          }
        }
      }
      csvStr+="\n";
      for (let j=0;j<taskData.itemsFiltered.length;j++)
      {
        let item=taskData.itemsFiltered[j];
        csvStr=csvStr+'"'+item['rnd_code']+'",';
        for(let  key in taskData.reportFields){
          let field=taskData.reportFields[key];
          for(let  k=1;k<=field.max_entry_no;k++){
            if(item[key+'_'+k]){
              if(['image'].indexOf(field.type) != -1){
                csvStr=csvStr+'"'+systemFunctions.getImageUrl(item[key+'_'+k])+'",';
              }
              else if(['features'].indexOf(field.type) != -1){
                let feature_text='';
                for(let feature_id in item[key+'_'+k]){
                  if(taskData.crop_features[item[key+'_'+k][feature_id]]){
                    feature_text+=taskData.crop_features[item[key+'_'+k][feature_id]].name+','
                  }
                }
                csvStr=csvStr+'"'+feature_text+'",';
              }
              else{
                csvStr=csvStr+'"'+item[key+'_'+k]+'",';
              }

            }
            else{
              csvStr=csvStr+'" ",';
            }
          }
        }
        csvStr+="\n";
      }

      let hiddenElement = document.createElement('a');
      hiddenElement.href = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURI(csvStr);
      hiddenElement.target = '_blank';
      hiddenElement.download = taskData.cropInfo.name+"-"+taskData.reportInfo.name
      hiddenElement.click();
    }

    const search=async ()=>{
      show_report.value=false;
      let formData=new FormData(document.getElementById('formSearch'))
      await axios.post(taskData.api_url+'/'+taskData.crop_id+'/'+taskData.report_id+'/'+taskData.trial_station_id+'/'+taskData.year+'/'+taskData.season_id+'/get-items',formData).then((res)=>{
        if (res.data.error == "") {
          taskData.reportFields=res.data.reportFields;
          taskData.itemsFiltered=res.data.data;
          show_report.value=true;
        }
        else{
          toastFunctions.showResponseError(res.data)
        }
      });
    }

    const changeUrl=()=>{
      show_report.value=false;
      let year=$('#year').val();
      let trial_station_id=$('#trial_station_id').val();
      let season_id=$('#season_id').val();
      globalVariables.loadListData=true;
      taskData.varieties={}
      router.push(taskData.api_url+'/'+taskData.crop_id+'/'+taskData.report_id+'/'+trial_station_id+'/'+year+'/'+season_id)
    }
    $(document).ready(function()
    {
      $(document).off("change", "#year,#trial_station_id,#season_id");
      $(document).on("change",'#year,#trial_station_id,#season_id',function()
      {
        changeUrl();
      })
    });

</script>

