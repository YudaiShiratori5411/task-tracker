package com.example.tasktracker.typehandler;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import com.example.tasktracker.model.Priority;

@MappedTypes(Priority.class)
public class PriorityTypeHandler extends BaseTypeHandler<Priority> {
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Priority parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.name());
    }

    @Override
    public Priority getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : Priority.valueOf(value);
    }

    @Override
    public Priority getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : Priority.valueOf(value);
    }

    @Override
    public Priority getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : Priority.valueOf(value);
    }
}