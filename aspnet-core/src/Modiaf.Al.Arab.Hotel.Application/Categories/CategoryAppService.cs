using System;
using Microsoft.AspNetCore.Authorization;
using Modiaf.Al.Arab.Hotel.DTO;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Modiaf.Al.Arab.Hotel.Categories;

[AllowAnonymous]
public class CategoryAppService(IRepository<Category, Guid> repository)
    : CrudAppService<Category, CategoryDto, Guid, PagedAndSortedResultRequestDto, CreateUpdateCategoryDto>(repository),
        ICategoryAppService
{
    protected override CategoryDto MapToGetOutputDto(Category entity)
    {
        return new CategoryDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Description = entity.Description,
            CreationTime = entity.CreationTime,
            CreatorId = entity.CreatorId,
            LastModificationTime = entity.LastModificationTime,
            LastModifierId = entity.LastModifierId
        };
    }

    protected override Category MapToEntity(CreateUpdateCategoryDto createInput)
    {
        return new Category(
            GuidGenerator.Create(),
            createInput.Name.Trim(),
            TrimOrNull(createInput.Description)
        );
    }

    protected override void MapToEntity(CreateUpdateCategoryDto updateInput, Category entity)
    {
        entity.Name = updateInput.Name.Trim();
        entity.Description = TrimOrNull(updateInput.Description);
    }

    private static string? TrimOrNull(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }
}

